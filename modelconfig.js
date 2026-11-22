'use strict';

/**
 * 模型接入收拢：解析「网关地址 + API Key + 模型名」的唯一入口。
 * 解析优先级（高 → 低）：
 *   Key : 请求头 x-api-key > 环境变量 WORDWISE_API_KEY > config.json apiKey
 *   Base: 客户端自带 Key 时 x-api-base 可覆盖；仅服务端 Key 时走
 *         WORDWISE_API_BASE > config.json apiBase（忽略客户端 base，防 Key 外泄/SSRF）
 *   模型: 请求体 model > WORDWISE_TEXT_MODEL 等环境变量 > config.json 对应字段
 * 代码不内置任何默认网关与模型名；未配置时返回空，由调用方拒绝请求并给出可读提示。
 */

function str(v) { return String(v == null ? '' : v).trim(); }

function resolveGateway(req, config) {
  const headers = (req && req.headers) || {};
  const clientKey = str(headers['x-api-key']);
  const key = clientKey || str(process.env.WORDWISE_API_KEY) || str(config.apiKey);
  const base = (clientKey
    ? str(headers['x-api-base'])
    : str(process.env.WORDWISE_API_BASE))
    || str(config.apiBase);
  return { key, base, clientKey: !!clientKey };
}

function resolveModel(requested, config, envName, configField) {
  return str(requested) || str(process.env[envName]) || str(config[configField]);
}

module.exports = { resolveGateway, resolveModel };
