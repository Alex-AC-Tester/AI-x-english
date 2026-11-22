# -*- coding: utf-8 -*-
"""
WordWise 本地 NLP 句法分析服务
- 基于 spaCy en_core_web_sm
- 提供确定性句法骨架：分词/词形还原/词性/依存句法/名词块/动词论元/子句边界
- 结果交由 Node 端注入 LLM prompt，作为"句法参考"提升 AI 讲解准确率
- 纯标准库 http.server，零 Web 框架依赖
"""
import json
import os
import sys
import re
import signal
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

try:
    import spacy
except ImportError:
    sys.stderr.write("ERROR: spaCy 未安装，请先 pip install spacy\n")
    sys.exit(1)

MODEL_NAME = os.environ.get("SPACY_MODEL", "en_core_web_sm")
try:
    NLP = spacy.load(MODEL_NAME)
except OSError:
    sys.stderr.write(
        "ERROR: spaCy 模型 %s 未安装，请先 python -m spacy download %s\n" % (MODEL_NAME, MODEL_NAME)
    )
    sys.exit(1)

# 依存关系中文说明（常见类型）
DEP_ZH = {
    "nsubj": "名词性主语", "nsubjpass": "被动主语", "csubj": "从句主语",
    "dobj": "直接宾语", "iobj": "间接宾语", "pobj": "介词宾语", "attr": "表语属性",
    "ROOT": "句子主干谓语", "aux": "助动词", "auxpass": "被动助动词", "cop": "系动词",
    "amod": "形容词修饰", "advmod": "副词修饰", "advcl": "状语从句", "acl": "名词从句修饰",
    "det": "限定词", "poss": "所有格", "prep": "介词", "pcomp": "介词补语",
    "nmod": "名词修饰", "compound": "复合词", "ccomp": "宾语从句", "xcomp": "开放补语",
    "conj": "并列", "cc": "并列连词", "mark": "从句引导词", "relcl": "关系从句",
    "prn": "代词指代", "nummod": "数词修饰", "neg": "否定", "case": "格标记",
    "appos": "同位语", "expl": "形式主语", "intj": "感叹", "punct": "标点",
    "npadvmod": "名词状语", "acomp": "形容词补语", "oprd": "宾语补足语",
    "dative": "与格", "agent": "施事", "subtok": "从属标记",
}
POS_ZH = {
    "NOUN": "名词", "VERB": "动词", "ADJ": "形容词", "ADV": "副词", "PRON": "代词",
    "DET": "限定词", "ADP": "介词", "CONJ": "连词", "SCONJ": "从属连词", "PART": "小品词",
    "AUX": "助动词", "NUM": "数词", "PUNCT": "标点", "SYM": "符号", "X": "其他",
    "PROPN": "专有名词", "INTJ": "感叹词", "SPACE": "空格",
}
# 需要对 LLM 强调的复杂句法特征
INTERESTING_DEPS = {"acl", "advcl", "ccomp", "xcomp", "relcl", "pcomp", "csubj", "appos", "acl"}


def analyze_sentence(text, with_preview=True):
    """对单个句子做确定性句法分析，返回结构化 JSON。"""
    doc = NLP(text.strip())
    tokens = []
    for t in doc:
        tokens.append({
            "i": t.i,
            "text": t.text,
            "lemma": t.lemma_,
            "pos": t.pos_,
            "posZh": POS_ZH.get(t.pos_, t.pos_),
            "tag": t.tag_,
            "dep": t.dep_,
            "depZh": DEP_ZH.get(t.dep_, t.dep_),
            "head": t.head.i,
            "headText": t.head.text,
            "children": [c.i for c in t.children],
        })

    # 句法树（以 ROOT 为中心）
    root = next((t for t in doc if t.dep_ == "ROOT"), None)
    tree = None
    if root:
        def node(t, depth=0):
            return {
                "i": t.i, "text": t.text, "dep": t.dep_, "depZh": DEP_ZH.get(t.dep_, t.dep_),
                "pos": t.pos_, "posZh": POS_ZH.get(t.pos_, t.pos_),
                "children": [node(c, depth + 1) for c in sorted(t.children, key=lambda x: x.i)]
                if depth < 12 else [],
            }
        tree = node(root)

    # 名词块
    chunks = [{"text": c.text, "head": c.root.text, "headI": c.root.i} for c in doc.noun_chunks]

    # 动词及其核心论元（主语/宾语/补语）
    verbs = []
    for t in doc:
        if t.pos_ in ("VERB", "AUX") and t.dep_ in ("ROOT", "acl", "advcl", "ccomp", "xcomp", "relcl", "csubj"):
            args = {"subj": [], "obj": [], "adv": [], "clause": []}
            for c in t.children:
                if c.dep_ in ("nsubj", "nsubjpass", "csubj"):
                    args["subj"].append(c.text)
                elif c.dep_ in ("dobj", "iobj", "attr", "oprd", "dative"):
                    args["obj"].append(c.text)
                elif c.dep_ in ("advmod", "advcl", "npadvmod"):
                    args["adv"].append(c.text)
                elif c.dep_ in ("ccomp", "xcomp", "acl", "relcl", "pcomp"):
                    args["clause"].append(c.text)
            verbs.append({
                "text": t.text, "lemma": t.lemma_, "i": t.i,
                "role": DEP_ZH.get(t.dep_, t.dep_),
                "subj": args["subj"], "obj": args["obj"], "adv": args["adv"], "clause": args["clause"],
            })

    # 从句 / 复杂结构标记
    clauses = []
    for t in doc:
        if t.dep_ in INTERESTING_DEPS or t.pos_ == "SCONJ":
            subtree = list(t.subtree)
            span = [x.text for x in sorted(subtree, key=lambda x: x.i)]
            clauses.append({
                "marker": t.text, "type": DEP_ZH.get(t.dep_, t.dep_), "dep": t.dep_,
                "text": " ".join(span)[:300], "head": t.head.text,
            })

    # 命名实体
    entities = [{"text": e.text, "label": e.label_, "start": e.start, "end": e.end} for e in doc.ents]

    # 句子类型判断（启发式）
    clause_deps = {t.dep_ for t in doc}
    markers = {t.text.lower() for t in doc if t.pos_ == "SCONJ"}
    # 疑问句判断：优先看问号；无问号时要求 W 词位于句首且不属于从句（避免关系代词 who/which 误判）
    has_qmark = any(t.text == "?" for t in doc)
    leading_wh = False
    for t in doc:
        if t.tag_ in ("WDT", "WP", "WRB"):
            # 句首前 3 个词内、充当核心论元、且其依附的动词属于主句（ROOT/ccomp）
            # 才算真疑问词；关系从句里的 that/which/who 不算
            if t.i < 3 and t.dep_ in ("nsubj", "dobj", "advmod", "attr", "ROOT"):
                head_dep = t.head.dep_ if t.head else ""
                if head_dep in ("ROOT", "ccomp", "xcomp") or t.dep_ == "ROOT":
                    leading_wh = True
            break
    questions = has_qmark or leading_wh
    passive = any(t.dep_ == "nsubjpass" for t in doc) or any(t.tag_ == "VBN" and any(c.dep_ == "auxpass" for c in t.children) for t in doc)
    sentence_type = "疑问句" if questions else ("被动句" if passive else "陈述句")
    complexity = "复杂" if (len(clauses) >= 2 or len(tokens) > 30) else ("中等" if (clauses or len(tokens) > 18) else "简单")

    result = {
        "ok": True,
        "engine": "spaCy/%s" % spacy.__version__,
        "model": MODEL_NAME,
        "sentence": text.strip(),
        "stats": {
            "tokens": len([t for t in doc if t.pos_ != "PUNCT"]),
            "words": len([t for t in doc if t.pos_ not in ("PUNCT", "SPACE")]),
            "clauses": len(clauses),
            "sentenceType": sentence_type,
            "complexity": complexity,
            "passive": passive,
            "question": questions,
        },
        "tokens": tokens,
        "tree": tree,
        "nounChunks": chunks,
        "verbs": verbs,
        "clauses": clauses,
        "entities": entities,
    }

    # 生成给 LLM 的紧凑文本预览（token 少、信息密度高）
    if with_preview:
        preview_lines = ["【本地 NLP 句法分析（确定性结果，供你参考校验）】"]
        preview_lines.append("句长 %d 词 | 句型 %s | 复杂度 %s | 从句/复杂结构 %d 处" % (
            result["stats"]["words"], sentence_type, complexity, len(clauses)))
        if root:
            preview_lines.append("主干: %s (%s)" % (root.text, DEP_ZH.get(root.dep_, root.dep_)))
        if verbs:
            vlines = []
            for v in verbs[:6]:
                parts = []
                if v["subj"]: parts.append("主语=" + "/".join(v["subj"]))
                if v["obj"]: parts.append("宾语=" + "/".join(v["obj"]))
                if v["adv"]: parts.append("状语=" + "/".join(v["adv"]))
                if v["clause"]: parts.append("从句=" + "/".join(v["clause"]))
                vlines.append("%s[%s] %s" % (v["lemma"], v["role"], "；".join(parts)))
            preview_lines.append("谓语与论元: " + " | ".join(vlines))
        if chunks:
            preview_lines.append("名词块: " + " / ".join(c["text"] for c in chunks[:12]))
        if clauses:
            preview_lines.append("从句标记: " + " ; ".join("%s(%s)->%s" % (c["marker"], c["type"], c["text"][:60]) for c in clauses[:6]))
        if entities:
            preview_lines.append("命名实体: " + " / ".join("%s(%s)" % (e["text"], e["label"]) for e in entities[:10]))
        result["preview"] = "\n".join(preview_lines)

    return result


def analyze_text(text, max_sentences=80):
    """批量分析文章中的句子（spaCy 自动分句），返回每句骨架 + 汇总预览。"""
    doc = NLP(text[:30000])
    sents = [s.text.strip() for s in doc.sents if s.text.strip()]
    total = len(sents)
    selected = sents[:max_sentences]
    results = []
    for i, s in enumerate(selected):
        try:
            results.append({"index": i, **analyze_sentence(s, with_preview=False)})
        except Exception as e:
            results.append({"index": i, "ok": False, "sentence": s, "error": str(e)})
    # 汇总预览（给全文分析/出题用）
    lines = ["【本地 NLP 全文句法概览（确定性结果，供你参考）】", "共 %d 句，已分析 %d 句：" % (total, len(results))]
    for r in results:
        if not r.get("ok"): continue
        st = r["stats"]
        root = r.get("tree")
        summary = "%d. [%s/%s,%d词,%d从句] %s" % (
            r["index"] + 1, st["sentenceType"], st["complexity"], st["words"], st["clauses"], r["sentence"][:90])
        if root: summary += " | 主干:" + root["text"]
        if r.get("clauses"): summary += " | 从句:" + "/".join(c["marker"] for c in r["clauses"][:3])
        lines.append(summary)
    return {
        "ok": True,
        "engine": "spaCy/%s" % spacy.__version__,
        "model": MODEL_NAME,
        "totalSentences": total,
        "analyzed": len(results),
        "sentences": results,
        "preview": "\n".join(lines),
    }


class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, fmt, *args):
        sys.stderr.write("[nlp] %s - %s\n" % (self.address_string(), fmt % args))

    def _send(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        # 不加 CORS 头：本服务只面向本机 Node 代理（同源转发），浏览器无需跨域访问
        self.end_headers()
        self.wfile.write(body)

    def _read(self):
        length = int(self.headers.get("Content-Length") or 0)
        if length > 4 * 1024 * 1024:
            raise ValueError("请求体过大")
        raw = self.rfile.read(length) if length else b"{}"
        return json.loads(raw.decode("utf-8"))

    def do_GET(self):
        if self.path.startswith("/health"):
            self._send(200, {"ok": True, "engine": "spaCy/%s" % spacy.__version__, "model": MODEL_NAME})
        else:
            self._send(404, {"ok": False, "error": "not found"})

    def do_POST(self):
        try:
            body = self._read()
        except Exception as e:
            self._send(400, {"ok": False, "error": "请求解析失败: %s" % e}); return

        try:
            if self.path.startswith("/analyze-sentence"):
                text = str(body.get("text") or "").strip()
                if not text:
                    self._send(400, {"ok": False, "error": "缺少 text"}); return
                self._send(200, analyze_sentence(text, with_preview=body.get("preview", True)))
            elif self.path.startswith("/analyze-text"):
                text = str(body.get("text") or "").strip()
                if not text:
                    self._send(400, {"ok": False, "error": "缺少 text"}); return
                try:
                    max_sentences = int(body.get("maxSentences", 80))
                except (TypeError, ValueError):
                    max_sentences = 80
                max_sentences = max(1, min(200, max_sentences))
                self._send(200, analyze_text(text, max_sentences=max_sentences))
            else:
                self._send(404, {"ok": False, "error": "not found"})
        except Exception as e:
            import traceback
            traceback.print_exc()
            self._send(500, {"ok": False, "error": str(e)})


def main():
    port = int(os.environ.get("NLP_PORT", "8791"))
    server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    sys.stderr.write("NLP 服务已启动: http://127.0.0.1:%d (模型 %s)\n" % (port, MODEL_NAME))
    def handle_sig(sig, frame):
        sys.stderr.write("NLP 服务关闭\n")
        server.shutdown()
        sys.exit(0)
    signal.signal(signal.SIGINT, handle_sig)
    signal.signal(signal.SIGTERM, handle_sig)
    server.serve_forever()


if __name__ == "__main__":
    main()
