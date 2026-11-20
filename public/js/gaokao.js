// 内置高考核心词汇（约 400 词）。格式：词|音标|词性|中文释义|例句或空
// 作为离线速查基础词库；单个单词无需调用 AI 即可直接查询。

const RAW = `abandon|/əˈbændən/|v.|放弃；抛弃|He abandoned the plan.
ability|/əˈbɪləti/|n.|能力；才能|She has the ability to learn quickly.
absent|/ˈæbsənt/|adj.|缺席的；不在的|He was absent from school.
absolute|/ˈæbsəluːt/|adj.|绝对的；完全的|That is an absolute fact.
absorb|/əbˈsɔːb/|v.|吸收；使全神贯注|Plants absorb water.
abstract|/ˈæbstrækt/|adj./n.|抽象的；摘要|The concept is abstract.
academic|/ˌækəˈdemɪk/|adj.|学术的；学业的|He has a good academic record.
accept|/əkˈsept/|v.|接受；认可|She accepted the invitation.
access|/ˈækses/|n./v.|通道；接近；使用权|Students have access to the library.
accommodate|/əˈkɒmədeɪt/|v.|容纳；住宿；适应|The hotel can accommodate 200 guests.
accompany|/əˈkʌmpəni/|v.|陪伴；伴随|She accompanied him to the station.
accomplish|/əˈkʌmplɪʃ/|v.|完成；实现|We accomplished the task on time.
account|/əˈkaʊnt/|n./v.|账户；叙述；解释|Can you account for your absence?
accurate|/ˈækjərət/|adj.|准确的；精确的|The report is accurate.
achieve|/əˈtʃiːv/|v.|达到；实现|He achieved his goal.
acknowledge|/əkˈnɒlɪdʒ/|v.|承认；致谢|She acknowledged her mistake.
acquire|/əˈkwaɪə/|v.|获得；学到|He acquired a good knowledge of French.
across|/əˈkrɒs/|prep.|穿过；在对面|Walk across the street.
act|/ækt/|v./n.|行动；表演；法案|Think before you act.
active|/ˈæktɪv/|adj.|活跃的；积极的|She is active in class.
actual|/ˈæktʃuəl/|adj.|实际的；真实的|The actual cost was higher.
adapt|/əˈdæpt/|v.|适应；改编|He adapted to the new environment.
add|/æd/|v.|增加；添加|Add some salt to the soup.
addict|/ˈædɪkt/|n./v.|上瘾者；使上瘾|He is a drug addict.
adequate|/ˈædɪkwət/|adj.|足够的；适当的|The supply is adequate.
adjust|/əˈdʒʌst/|v.|调整；适应|Adjust the chair to your height.
admire|/ədˈmaɪə/|v.|钦佩；欣赏|I admire her courage.
admit|/ədˈmɪt/|v.|承认；准许进入|He admitted telling a lie.
adopt|/əˈdɒpt/|v.|采用；收养|They adopted a child.
advance|/ədˈvɑːns/|v./n.|前进；进步；预先|Science has advanced greatly.
advantage|/ədˈvɑːntɪdʒ/|n.|优势；有利条件|Knowledge is an advantage.
adventure|/ədˈventʃə/|n.|冒险；奇遇|They had an adventure in the forest.
advertise|/ˈædvətaɪz/|v.|做广告；宣传|The product was advertised on TV.
advice|/ədˈvaɪs/|n.|建议；忠告|Can you give me some advice?
affect|/əˈfekt/|v.|影响；感动|The weather affects our mood.
afford|/əˈfɔːd/|v.|负担得起；提供|I can't afford a new car.
afraid|/əˈfreɪd/|adj.|害怕的；担心的|She is afraid of dogs.
agency|/ˈeɪdʒənsi/|n.|代理处；机构|a travel agency
aggressive|/əˈɡresɪv/|adj.|好斗的；进取的|He has an aggressive attitude.
agree|/əˈɡriː/|v.|同意；一致|We agree on the plan.
agriculture|/ˈæɡrɪkʌltʃə/|n.|农业| Agriculture is important.
aim|/eɪm/|n./v.|目标；瞄准|His aim is to win.
air|/eə/|n.|空气；天空；神情|The air is fresh.
alarm|/əˈlɑːm/|n./v.|警报；惊恐|The alarm went off.
album|/ˈælbəm/|n.|相册；唱片集|She bought a new album.
alive|/əˈlaɪv/|adj.|活着的；活跃的|He is still alive.
allow|/əˈlaʊ/|v.|允许；准许|We are not allowed to smoke here.
almost|/ˈɔːlməʊst/|adv.|几乎；差不多|It's almost finished.
alone|/əˈləʊn/|adj./adv.|单独的；独自|He lives alone.
along|/əˈlɒŋ/|prep./adv.|沿着；一起|Walk along the river.
already|/ɔːlˈredi/|adv.|已经|I have already eaten.
also|/ˈɔːlsəʊ/|adv.|也；而且|He also likes music.
although|/ɔːlˈðəʊ/|conj.|虽然；尽管|Although it rained, we went out.
altogether|/ˌɔːltəˈɡeðə/|adv.|总共；完全|It cost 100 dollars altogether.
always|/ˈɔːlweɪz/|adv.|总是；一直|He is always late.
amaze|/əˈmeɪz/|v.|使惊讶|The news amazed everyone.
ambition|/æmˈbɪʃn/|n.|雄心；志向|Her ambition is to be a doctor.
among|/əˈmʌŋ/|prep.|在……之中|He is among the best students.
amount|/əˈmaʊnt/|n./v.|数量；总计|a large amount of money
amuse|/əˈmjuːz/|v.|使发笑；使愉快|The story amused the kids.
analyse|/ˈænəlaɪz/|v.|分析|Analyse the data carefully.
ancient|/ˈeɪnʃənt/|adj.|古代的；古老的|ancient civilization
angle|/ˈæŋɡl/|n.|角；角度|Look at it from a different angle.
angry|/ˈæŋɡri/|adj.|生气的|Don't be angry with me.
animal|/ˈænɪml/|n.|动物|Wild animals
announce|/əˈnaʊns/|v.|宣布；通告|They announced the result.
annual|/ˈænjuəl/|adj.|每年的；年度的|an annual report
anxious|/ˈæŋkʃəs/|adj.|焦虑的；渴望的|She is anxious about the exam.
apart|/əˈpɑːt/|adv./adj.|分开；相隔|The two houses are far apart.
apologize|/əˈpɒlədʒaɪz/|v.|道歉|He apologized for being late.
appear|/əˈpɪə/|v.|出现；显得|A rainbow appeared.
apply|/əˈplaɪ/|v.|申请；应用；涂|He applied for the job.
appoint|/əˈpɔɪnt/|v.|任命；约定|She was appointed manager.
appreciate|/əˈpriːʃieɪt/|v.|欣赏；感激|I appreciate your help.
approach|/əˈprəʊtʃ/|n./v.|方法；接近|Winter is approaching.
approve|/əˈpruːv/|v.|批准；赞成|The plan was approved.
area|/ˈeəriə/|n.|地区；面积；领域|a residential area
argue|/ˈɑːɡjuː/|v.|争论；主张|They argued about the plan.
arise|/əˈraɪz/|v.|出现；产生|Problems may arise.
arrange|/əˈreɪndʒ/|v.|安排；排列|I arranged a meeting.
arrive|/əˈraɪv/|v.|到达|We arrived at the station.
article|/ˈɑːtɪkl/|n.|文章；物品；冠词|an interesting article
artist|/ˈɑːtɪst/|n.|艺术家|She is a famous artist.
ashamed|/əˈʃeɪmd/|adj.|羞愧的|He felt ashamed of his behavior.
aside|/əˈsaɪd/|adv.|在旁边；到一边|Put it aside for now.
ask|/ɑːsk/|v.|问；请求；要求|May I ask a question?
asleep|/əˈsliːp/|adj.|睡着的|The baby is asleep.
aspect|/ˈæspekt/|n.|方面；层面|Consider every aspect.
assess|/əˈses/|v.|评估；评定|We assessed the risk.
assign|/əˈsaɪn/|v.|分配；布置|The teacher assigned homework.
assist|/əˈsɪst/|v.|帮助；协助|She assisted the teacher.
assume|/əˈsjuːm/|v.|假定；承担|I assume he is honest.
astonish|/əˈstɒnɪʃ/|v.|使惊讶|The result astonished us.
athlete|/ˈæθliːt/|n.|运动员|He is a professional athlete.
atmosphere|/ˈætməsfɪə/|n.|大气；气氛|The atmosphere is relaxing.
attach|/əˈtætʃ/|v.|附上；系上；重视|Attach a photo to the form.
attack|/əˈtæk/|v./n.|攻击；进攻|The army attacked at dawn.
attempt|/əˈtempt/|n./v.|尝试；企图|He made an attempt to escape.
attend|/əˈtend/|v.|出席；照料|He attended the meeting.
attitude|/ˈætɪtjuːd/|n.|态度；看法|a positive attitude
attract|/əˈtrækt/|v.|吸引|The city attracts tourists.
audience|/ˈɔːdiəns/|n.|观众；听众|The audience applauded.
author|/ˈɔːθə/|n.|作者；作家|Who is the author?
automatic|/ˌɔːtəˈmætɪk/|adj.|自动的|an automatic door
available|/əˈveɪləbl/|adj.|可获得的；有空的|The book is available now.
avoid|/əˈvɔɪd/|v.|避免；躲开|Avoid making the same mistake.
awake|/əˈweɪk/|adj./v.|醒着的；唤醒|He was still awake.
award|/əˈwɔːd/|n./v.|奖品；授予|She won an award.
aware|/əˈweə/|adj.|意识到的|I am aware of the problem.
balance|/ˈbæləns/|n./v.|平衡；余额|Keep a balanced diet.
barrier|/ˈbæriə/|n.|障碍；屏障|Language can be a barrier.
basic|/ˈbeɪsɪk/|adj.|基本的；基础的|basic skills
basis|/ˈbeɪsɪs/|n.|基础；根据|on the basis of
bear|/beə/|v.|承受；忍受；生育|I can't bear the noise.
beat|/biːt/|v.|击败；敲打|Our team beat theirs.
become|/bɪˈkʌm/|v.|变成；成为|He became a teacher.
before|/bɪˈfɔː/|prep./adv.|在……之前|Finish it before dinner.
begin|/bɪˈɡɪn/|v.|开始|Let's begin the lesson.
behave|/bɪˈheɪv/|v.|表现；举止|The child behaved well.
behind|/bɪˈhaɪnd/|prep.|在……后面|He hid behind the tree.
believe|/bɪˈliːv/|v.|相信；认为|I believe in you.
benefit|/ˈbenɪfɪt/|n./v.|益处；受益|Exercise benefits health.
besides|/bɪˈsaɪdz/|prep./adv.|除……之外；而且|Besides, it's too late.
better|/ˈbetə/|adj./adv.|更好的；改善|You'd better leave now.
beyond|/bɪˈjɒnd/|prep.|超过；在……那边|The town is beyond the hill.
bid|/bɪd/|v./n.|出价；投标；告别|He bid farewell to his friends.
bill|/bɪl/|n.|账单；法案；钞票|Pay the bill, please.
birth|/bɜːθ/|n.|出生；诞生|the place of birth
bit|/bɪt/|n.|一点；少量|a bit of water
blame|/bleɪm/|v./n.|责备；责任|Don't blame others.
blank|/blæŋk/|n./adj.|空白；空白的|Fill in the blanks.
blind|/blaɪnd/|adj.|失明的；盲目的|He is blind in one eye.
block|/blɒk/|n./v.|街区；障碍；阻塞|The road is blocked.
blood|/blʌd/|n.|血；血液|blood pressure
blow|/bləʊ/|v./n.|吹；打击|The wind blew hard.
board|/bɔːd/|n./v.|木板；董事会；上车|a black board
boost|/buːst/|v./n.|促进；提高|The policy boosted the economy.
border|/ˈbɔːdə/|n.|边界；边框|the border between two countries
borrow|/ˈbɒrəʊ/|v.|借入|Can I borrow your pen?
bother|/ˈbɒðə/|v.|打扰；担心|Don't bother me now.
bottom|/ˈbɒtəm/|n./adj.|底部；最下面的|at the bottom of the page
bound|/baʊnd/|adj./v.|受约束的；跳跃|be bound to do
brain|/breɪn/|n.|大脑；智力|Use your brain.
branch|/brɑːntʃ/|n.|树枝；分支；分行|a bank branch
brave|/breɪv/|adj.|勇敢的|a brave soldier
bread|/bred/|n.|面包|bread and butter
break|/breɪk/|v./n.|打破；休息|Break the egg carefully.
breath|/breθ/|n.|呼吸；气息|Take a deep breath.
bring|/brɪŋ/|v.|带来；引起|Bring your book tomorrow.
broad|/brɔːd/|adj.|宽的；广泛的|broad shoulders
brother|/ˈbrʌðə/|n.|兄弟|my elder brother
build|/bɪld/|v.|建造；建立|They built a bridge.
bunch|/bʌntʃ/|n.|束；串|a bunch of flowers
burden|/ˈbɜːdn/|n./v.|负担；重担|The burden is heavy.
burn|/bɜːn/|v.|燃烧；烧毁|The fire burned all night.
burst|/bɜːst/|v./n.|爆发；破裂|The balloon burst.
bury|/ˈberi/|v.|埋葬；掩埋| bury the dead
business|/ˈbɪznəs/|n.|生意；事务；企业|mind your own business
busy|/ˈbɪzi/|adj.|忙碌的|I am busy today.
but|/bʌt/|conj.|但是|Small but strong.
buy|/baɪ/|v.|买|I bought a new pen.
camera|/ˈkæmərə/|n.|相机|Take a photo with the camera.
campaign|/kæmˈpeɪn/|n./v.|运动；战役|a campaign for equality
campus|/ˈkæmpəs/|n.|校园|on campus
can|/kæn/|v.|能；可以；罐头|I can swim.
cancel|/ˈkænsl/|v.|取消|The meeting was cancelled.
candidate|/ˈkændɪdət/|n.|候选人；考生|a presidential candidate
capable|/ˈkeɪpəbl/|adj.|有能力的|He is capable of doing it.
capital|/ˈkæpɪtl/|n./adj.|首都；资本；大写的|the capital city
captain|/ˈkæptɪn/|n.|船长；队长|the captain of the team
capture|/ˈkæptʃə/|v./n.|捕获；俘虏；拍摄|The photo captured the moment.
car|/kɑː/|n.|汽车|by car
care|/keə/|n./v.|关心；照顾；在意|Take care of yourself.
career|/kəˈrɪə/|n.|职业；生涯|a successful career
careful|/ˈkeəfl/|adj.|小心的；仔细的|Be careful with the knife.
carry|/ˈkæri/|v.|携带；搬运；进行|Carry the box upstairs.
case|/keɪs/|n.|情况；案例；箱子|in case of fire
cash|/kæʃ/|n./v.|现金；兑现|pay in cash
cast|/kɑːst/|v./n.|投；铸造；演员表|cast a vote
cat|/kæt/|n.|猫|a lazy cat
catch|/kætʃ/|v.|抓住；赶上；染上|Catch the bus.
cause|/kɔːz/|n./v.|原因；导致|What caused the fire?
caution|/ˈkɔːʃn/|n./v.|谨慎；警告|Use caution when driving.
ceiling|/ˈsiːlɪŋ/|n.|天花板；上限|The ceiling is high.
celebrate|/ˈselɪbreɪt/|v.|庆祝|They celebrated the victory.
cell|/sel/|n.|细胞；小房间；电池|a blood cell
central|/ˈsentrəl/|adj.|中心的；主要的|the central part
century|/ˈsentʃəri/|n.|世纪|the 21st century
certainly|/ˈsɜːtnli/|adv.|当然；肯定|Certainly, I can help.
challenge|/ˈtʃælɪndʒ/|n./v.|挑战|Life is full of challenges.
chance|/tʃɑːns/|n.|机会；可能性|Give me a chance.
change|/tʃeɪndʒ/|v./n.|改变；零钱|Times have changed.
character|/ˈkærəktə/|n.|性格；人物；字符|He has a strong character.
charge|/tʃɑːdʒ/|v./n.|收费；充电；指控|The service is free of charge.
chat|/tʃæt/|v./n.|聊天|We chatted for hours.
cheap|/tʃiːp/|adj.|便宜的|a cheap watch
check|/tʃek/|v./n.|检查；核对|Check your answers.
cheer|/tʃɪə/|v./n.|欢呼；使高兴|Cheer up!
cheese|/tʃiːz/|n.|奶酪|a piece of cheese
chief|/tʃiːf/|n./adj.|首领；主要的|the chief reason
child|/tʃaɪld/|n.|孩子|a naughty child
choice|/tʃɔɪs/|n.|选择|It's your choice.
choose|/tʃuːz/|v.|选择|Choose the right answer.
church|/tʃɜːtʃ/|n.|教堂|go to church
circle|/ˈsɜːkl/|n./v.|圆；圈；环绕|Draw a circle.
citizen|/ˈsɪtɪzn/|n.|公民|Every citizen has rights.
city|/ˈsɪti/|n.|城市|a big city
civil|/ˈsɪvl/|adj.|公民的；文明的；国内的|civil rights
claim|/kleɪm/|v./n.|声称；要求；索赔|He claimed he was right.
class|/klɑːs/|n.|班级；课；等级|in class
classic|/ˈklæsɪk/|adj./n.|经典的；经典作品|a classic novel
clear|/klɪə/|adj./v.|清晰的；清除|The sky is clear.
clerk|/klɑːk/|n.|职员；店员|a bank clerk
clever|/ˈklevə/|adj.|聪明的|a clever idea
client|/ˈklaɪənt/|n.|客户|a law client
climate|/ˈklaɪmət/|n.|气候|The climate is mild.
close|/kləʊs/|v./adj.|关闭；近的|Close the door.
cloth|/klɒθ/|n.|布；布料|a piece of cloth
clothes|/kləʊðz/|n.|衣服|new clothes
cloud|/klaʊd/|n.|云|a cloudy day
club|/klʌb/|n.|俱乐部；棍棒|a football club
coach|/kəʊtʃ/|n./v.|教练；长途汽车；训练|a basketball coach
coast|/kəʊst/|n.|海岸|along the coast
coffee|/ˈkɒfi/|n.|咖啡|a cup of coffee
collect|/kəˈlekt/|v.|收集；领取|Collect the rubbish.
college|/ˈkɒlɪdʒ/|n.|大学；学院|go to college
colour|/ˈkʌlə/|n./v.|颜色；着色|What colour is it?
combine|/kəmˈbaɪn/|v.|结合；联合|Combine theory with practice.
come|/kʌm/|v.|来；出现|Come here, please.
comfort|/ˈkʌmfət/|n./v.|舒适；安慰|She comforted the child.
command|/kəˈmɑːnd/|v./n.|命令；掌握|He commanded the army.
comment|/ˈkɒment/|n./v.|评论|Do you have any comments?
common|/ˈkɒmən/|adj.|常见的；共同的|common sense
communicate|/kəˈmjuːnɪkeɪt/|v.|交流；沟通|We communicate by email.
community|/kəˈmjuːnəti/|n.|社区；群体|a local community
company|/ˈkʌmpəni/|n.|公司；陪伴|a software company
compare|/kəmˈpeə/|v.|比较|Compare the two plans.
compete|/kəmˈpiːt/|v.|竞争|We compete with other teams.
complete|/kəmˈpliːt/|adj./v.|完整的；完成|Complete the work.
complex|/ˈkɒmpleks/|adj.|复杂的|a complex problem
concern|/kənˈsɜːn/|v./n.|关心；担忧；涉及|This concerns everyone.
condition|/kənˈdɪʃn/|n.|条件；状况|in good condition
conduct|/kənˈdʌkt/|v./n.|进行；行为；实施|conduct an experiment
confidence|/ˈkɒnfɪdəns/|n.|信心|He has confidence in himself.
confirm|/kənˈfɜːm/|v.|确认；证实|Please confirm your booking.
conflict|/ˈkɒnflɪkt/|n./v.|冲突；矛盾|a conflict between two groups
confuse|/kənˈfjuːz/|v.|使困惑|The question confused me.
congratulate|/kənˈɡrætʃuleɪt/|v.|祝贺|We congratulated her on winning.
connect|/kəˈnekt/|v.|连接；联系|Connect the wire to the battery.
consider|/kənˈsɪdə/|v.|考虑；认为|Consider the cost.
constant|/ˈkɒnstənt/|adj.|不断的；恒定的|constant change
construct|/kənˈstrʌkt/|v.|建造；构造|They constructed a new road.
consult|/kənˈsʌlt/|v.|咨询；查阅|Consult a doctor.
consume|/kənˈsjuːm/|v.|消耗；消费|This car consumes less fuel.
contact|/ˈkɒntækt/|n./v.|接触；联系|Keep in contact with me.
contain|/kənˈteɪn/|v.|包含；容纳|The box contains books.
content|/ˈkɒntent/|n./adj.|内容；满意的|the content of the book
continue|/kənˈtɪnjuː/|v.|继续|Continue reading.
contract|/ˈkɒntrækt/|n./v.|合同；收缩|sign a contract
contrast|/ˈkɒntrɑːst/|n./v.|对比；差异|in contrast to
contribute|/kənˈtrɪbjuːt/|v.|贡献；投稿；促成|Everyone contributed to the project.
control|/kənˈtrəʊl/|v./n.|控制|Control your temper.
convenient|/kənˈviːniənt/|adj.|方便的|Is it convenient for you?
conversation|/ˌkɒnvəˈseɪʃn/|n.|对话|We had a long conversation.
convince|/kənˈvɪns/|v.|说服；使确信|He convinced me to stay.
cooperate|/kəʊˈɒpəreɪt/|v.|合作|We should cooperate.
cope|/kəʊp/|v.|应对；处理|cope with stress
copy|/ˈkɒpi/|v./n.|复制；副本|Copy this sentence.
correct|/kəˈrekt/|adj./v.|正确的；改正|Correct the mistakes.
cost|/kɒst/|v./n.|花费；成本|How much does it cost?
courage|/ˈkʌrɪdʒ/|n.|勇气|He showed great courage.
course|/kɔːs/|n.|课程；过程；一道菜|an English course
court|/kɔːt/|n.|法庭；球场|in court
cover|/ˈkʌvə/|v./n.|覆盖；报道；封面|The snow covered the ground.
crash|/kræʃ/|v./n.|碰撞；崩溃|The car crashed into a tree.
create|/kriˈeɪt/|v.|创造；创建|They created a new system.
credit|/ˈkredit/|n.|信用；学分；赞扬|Credit card
crew|/kruː/|n.|全体船员；工作人员|the film crew
crime|/kraɪm/|n.|犯罪|commit a crime
crisis|/ˈkraɪsɪs/|n.|危机|an economic crisis
critical|/ˈkrɪtɪkl/|adj.|批判的；关键的|a critical moment
criticize|/ˈkrɪtɪsaɪz/|v.|批评|Don't criticize others harshly.
crop|/krɒp/|n./v.|农作物；收成；修剪|Rice is a major crop.
cross|/krɒs/|v./n.|穿过；十字|Cross the road carefully.
crowd|/kraʊd/|n./v.|人群；拥挤|A crowd gathered.
cruel|/ˈkruːəl/|adj.|残酷的|a cruel king
culture|/ˈkʌltʃə/|n.|文化|Western culture
curious|/ˈkjʊəriəs/|adj.|好奇的|I am curious about it.
current|/ˈkʌrənt/|adj./n.|当前的；水流；电流|the current situation
custom|/ˈkʌstəm/|n.|习俗；习惯|local customs
cut|/kʌt/|v./n.|切；削减|a deep cut
daily|/ˈdeɪli/|adj./adv.|每日的；每天|a daily newspaper
damage|/ˈdæmɪdʒ/|v./n.|损害；破坏|The storm damaged the crops.
danger|/ˈdeɪndʒə/|n.|危险|in danger
dare|/deə/|v.|敢|I dare not go alone.
dark|/dɑːk/|adj./n.|黑暗的；黑暗|It's getting dark.
data|/ˈdeɪtə/|n.|数据|analyse the data
date|/deɪt/|n./v.|日期；约会|What's the date today?
daughter|/ˈdɔːtə/|n.|女儿|my daughter
dead|/ded/|adj.|死的；无生命的|The plant is dead.
deal|/diːl/|v./n.|处理；交易|deal with a problem
dear|/dɪə/|adj.|亲爱的；昂贵的|Dear friends
death|/deθ/|n.|死亡|the cause of death
debate|/dɪˈbeɪt/|n./v.|辩论|a heated debate
debt|/det/|n.|债务|pay off a debt
decade|/ˈdekeɪd/|n.|十年|in the last decade
decide|/dɪˈsaɪd/|v.|决定|We decided to leave early.
declare|/dɪˈkleə/|v.|宣布；声明|declare war
decline|/dɪˈklaɪn/|v./n.|下降；婉拒|a sharp decline
decorate|/ˈdekəreɪt/|v.|装饰|We decorated the room.
decrease|/dɪˈkriːs/|v./n.|减少|The price decreased.
deep|/diːp/|adj./adv.|深的；深深地|deep water
defeat|/dɪˈfiːt/|v./n.|击败；失败|We defeated the enemy.
defend|/dɪˈfend/|v.|防御；辩护|defend one's country
define|/dɪˈfaɪn/|v.|定义；界定|define a word
definite|/ˈdefɪnət/|adj.|明确的|a definite answer
degree|/dɪˈɡriː/|n.|学位；程度；度|a bachelor's degree
delay|/dɪˈleɪ/|v./n.|延迟；耽搁|The train was delayed.
delight|/dɪˈlaɪt/|n./v.|快乐；使高兴|To my delight, she came.
deliver|/dɪˈlɪvə/|v.|递送；发表；接生|deliver a speech
demand|/dɪˈmɑːnd/|n./v.|要求；需求|There is a great demand for it.
deny|/dɪˈnaɪ/|v.|否认；拒绝|He denied the accusation.
depend|/dɪˈpend/|v.|依靠；取决于|It depends on the weather.
describe|/dɪˈskraɪb/|v.|描述|Describe the picture.
desert|/ˈdezət/|n./v.|沙漠；抛弃|the Sahara Desert
deserve|/dɪˈzɜːv/|v.|应得；值得|He deserves the prize.
design|/dɪˈzaɪn/|v./n.|设计|a beautiful design
desire|/dɪˈzaɪə/|n./v.|渴望；欲望|a strong desire to win
desk|/desk/|n.|书桌|on the desk
despite|/dɪˈspaɪt/|prep.|尽管|Despite the rain, we went out.
destroy|/dɪˈstrɔɪ/|v.|破坏；摧毁|The fire destroyed the house.
detail|/ˈdiːteɪl/|n./v.|细节；详述|in detail
detect|/dɪˈtekt/|v.|发现；检测|The police detected the crime.
determine|/dɪˈtɜːmɪn/|v.|决定；确定|We must determine the cause.
develop|/dɪˈveləp/|v.|发展；开发；培养|develop a skill
device|/dɪˈvaɪs/|n.|装置；设备|an electronic device
devote|/dɪˈvəʊt/|v.|奉献；致力于|She devoted her life to teaching.
diamond|/ˈdaɪəmənd/|n.|钻石|a diamond ring
die|/daɪ/|v.|死；消失|The flowers died.
diet|/ˈdaɪət/|n./v.|饮食；节食|a balanced diet
differ|/ˈdɪfə/|v.|不同；相异|Opinions differ.
different|/ˈdɪfrənt/|adj.|不同的|a different approach
difficult|/ˈdɪfɪkəlt/|adj.|困难的|a difficult question
dig|/dɪɡ/|v.|挖；发掘|dig a hole
dinner|/ˈdɪnə/|n.|正餐；晚餐|have dinner
direct|/dɪˈrekt/|adj./v.|直接的；指导|a direct flight
direction|/dɪˈrekʃn/|n.|方向；指示|in the right direction
dirty|/ˈdɜːti/|adj.|脏的|a dirty room
discover|/dɪˈskʌvə/|v.|发现|Scientists discovered a new planet.
discuss|/dɪˈskʌs/|v.|讨论|Let's discuss the problem.
disease|/dɪˈziːz/|n.|疾病|a serious disease
dismiss|/dɪsˈmɪs/|v.|解雇；解散；驳回|The class was dismissed.
display|/dɪˈspleɪ/|v./n.|展示；陈列|The goods were displayed.
distance|/ˈdɪstəns/|n.|距离|a long distance
distant|/ˈdɪstənt/|adj.|遥远的|a distant village
distinguish|/dɪˈstɪŋɡwɪʃ/|v.|区分；辨别|distinguish right from wrong
distribute|/dɪˈstrɪbjuːt/|v.|分发；分布|distribute the books
disturb|/dɪˈstɜːb/|v.|打扰；扰乱|Don't disturb me.
diverse|/daɪˈvɜːs/|adj.|多样的；不同的|diverse cultures
divide|/dɪˈvaɪd/|v.|分开；划分|Divide the cake into four.
divorce|/dɪˈvɔːs/|n./v.|离婚|get a divorce
doctor|/ˈdɒktə/|n.|医生；博士|See a doctor.
document|/ˈdɒkjumənt/|n.|文件；文献|an important document
dog|/dɒɡ/|n.|狗|a faithful dog
domestic|/dəˈmestɪk/|adj.|国内的；家庭的|domestic affairs
dominate|/ˈdɒmɪneɪt/|v.|支配；主导|The company dominates the market.
door|/dɔː/|n.|门|Close the door.
double|/ˈdʌbl/|adj./v.|双倍的；使加倍|a double room
doubt|/daʊt/|n./v.|怀疑|I have no doubt about it.
down|/daʊn/|adv./prep.|向下；沿着|Walk down the hill.
download|/ˈdaʊnləʊd/|v./n.|下载|download a file
draft|/drɑːft/|n./v.|草稿；起草|a rough draft
drag|/dræɡ/|v.|拖；拽|Drag the chair over.
draw|/drɔː/|v.|画；拉；吸引|She can draw well.
dream|/driːm/|n./v.|梦想；做梦|a big dream
dress|/dres/|n./v.|连衣裙；穿衣|Get dressed quickly.
drink|/drɪŋk/|v./n.|喝；饮料|drink some water
drive|/draɪv/|v./n.|驾驶；驱动|a long drive
drop|/drɒp/|v./n.|落下；滴；放弃|Don't drop the glass.
dry|/draɪ/|adj./v.|干的；弄干|dry clothes
due|/djuː/|adj.|到期的；应付的；由于|The report is due tomorrow.
dull|/dʌl/|adj.|枯燥的；迟钝的|a dull lecture
during|/ˈdjʊərɪŋ/|prep.|在……期间|during the holidays
duty|/ˈdjuːti/|n.|责任；职责；税|It's my duty.
each|/iːtʃ/|adj./pron.|每个|each student
eager|/ˈiːɡə/|adj.|渴望的|She is eager to learn.
earn|/ɜːn/|v.|挣得；获得|He earns a living by writing.
earth|/ɜːθ/|n.|地球；土地|the earth
ease|/iːz/|n./v.|容易；舒适；减轻|with ease
easy|/ˈiːzi/|adj.|容易的|an easy question
eat|/iːt/|v.|吃|Let's eat lunch.
economic|/ˌiːkəˈnɒmɪk/|adj.|经济的|economic growth
economy|/ɪˈkɒnəmi/|n.|经济；节约|the world economy
edge|/edʒ/|n.|边缘|on the edge of the cliff
educate|/ˈedʒukeɪt/|v.|教育|We are educated at school.
effect|/ɪˈfekt/|n.|效果；影响|have an effect on
efficient|/ɪˈfɪʃnt/|adj.|高效的|an efficient worker
effort|/ˈefət/|n.|努力|make an effort
either|/ˈaɪðə/|adj./adv.|两者之一；也|Either answer is fine.
elder|/ˈeldə/|adj.|年长的|my elder brother
elect|/ɪˈlekt/|v.|选举|They elected him president.
electric|/ɪˈlektrɪk/|adj.|电的|an electric car
else|/els/|adv.|其他的；否则|something else
embarrass|/ɪmˈbærəs/|v.|使尴尬|I was embarrassed by the question.
embrace|/ɪmˈbreɪs/|v./n.|拥抱；接受|She embraced the idea.
emerge|/iˈmɜːdʒ/|v.|出现；浮现|The sun emerged from the clouds.
emotion|/ɪˈməʊʃn/|n.|情感；情绪|mixed emotions
emphasize|/ˈemfəsaɪz/|v.|强调|He emphasized the importance of education.
employ|/ɪmˈplɔɪ/|v.|雇佣；使用|The company employs 500 people.
empty|/ˈempti/|adj./v.|空的；倒空|an empty box
enable|/ɪˈneɪbl/|v.|使能够|The training enabled him to succeed.
encourage|/ɪnˈkʌrɪdʒ/|v.|鼓励|My parents encouraged me.
end|/end/|n./v.|结束；末端|The meeting ended early.
endure|/ɪnˈdjʊə/|v.|忍受；持续|He endured great pain.
enemy|/ˈenəmi/|n.|敌人|a bitter enemy
energy|/ˈenədʒi/|n.|能量；精力|renewable energy
enforce|/ɪnˈfɔːs/|v.|执行；强制|enforce the law
engage|/ɪnˈɡeɪdʒ/|v.|参与；从事；订婚|engage in research
engine|/ˈendʒɪn/|n.|发动机|a car engine
enjoy|/ɪnˈdʒɔɪ/|v.|享受；喜欢|Enjoy your meal!
enough|/ɪˈnʌf/|adj./adv.|足够的|We have enough time.
ensure|/ɪnˈʃʊə/|v.|确保|Please ensure the door is locked.
enter|/ˈentə/|v.|进入|Come in, please.
entire|/ɪnˈtaɪə/|adj.|整个的|the entire day
entrance|/ˈentrəns/|n.|入口|the entrance to the building
environment|/ɪnˈvaɪrənmənt/|n.|环境|protect the environment
equal|/ˈiːkwəl/|adj./v.|平等的；等于|All men are created equal.
equip|/ɪˈkwɪp/|v.|装备|The room is well equipped.
error|/ˈerə/|n.|错误|a serious error
escape|/ɪˈskeɪp/|v./n.|逃跑；逃脱|He escaped from prison.
especially|/ɪˈspeʃəli/|adv.|尤其；特别|I like fruit, especially apples.
essential|/ɪˈsenʃl/|adj.|必要的；本质的|Water is essential to life.
establish|/ɪˈstæblɪʃ/|v.|建立；确立|The school was established in 1900.
estimate|/ˈestɪmeɪt/|v./n.|估计|The cost is estimated at 1000 dollars.
evaluate|/ɪˈvæljueɪt/|v.|评估|evaluate the results
even|/ˈiːvn/|adv./adj.|甚至；平坦的|Even children know it.
event|/ɪˈvent/|n.|事件；比赛项目|a major event
eventually|/ɪˈventʃuəli/|adv.|最终|Eventually, he succeeded.
ever|/ˈevə/|adv.|曾经|Have you ever been there?
every|/ˈevri/|adj.|每个|every day
evidence|/ˈevɪdəns/|n.|证据|There is strong evidence.
exact|/ɪɡˈzækt/|adj.|精确的|the exact time
examine|/ɪɡˈzæmɪn/|v.|检查；考试|The doctor examined him.
example|/ɪɡˈzɑːmpl/|n.|例子|for example
excellent|/ˈeksələnt/|adj.|优秀的|excellent work
except|/ɪkˈsept/|prep.|除……之外|Everyone came except Tom.
exchange|/ɪksˈtʃeɪndʒ/|v./n.|交换；交流|exchange ideas
excite|/ɪkˈsaɪt/|v.|使兴奋|The news excited everyone.
excuse|/ɪkˈskjuːs/|n./v.|借口；原谅|Excuse me.
exercise|/ˈeksəsaɪz/|n./v.|锻炼；练习|do morning exercises
exhibit|/ɪɡˈzɪbɪt/|v./n.|展出；展品|The paintings are exhibited.
exist|/ɪɡˈzɪst/|v.|存在|Does life exist on Mars?
exit|/ˈeksɪt/|n./v.|出口；退出|Find the exit.
expand|/ɪkˈspænd/|v.|扩大；膨胀|The company expanded.
expect|/ɪkˈspekt/|v.|期待；预料|I expect to hear from you.
expense|/ɪkˈspens/|n.|费用；开支|at the expense of
experience|/ɪkˈspɪəriəns/|n./v.|经验；经历|He has a lot of experience.
experiment|/ɪkˈsperɪmənt/|n./v.|实验|do an experiment
explain|/ɪkˈspleɪn/|v.|解释|Can you explain it?
explore|/ɪkˈsplɔː/|v.|探索；探究|explore the unknown
export|/ˈekspɔːt/|v./n.|出口|China exports goods.
expose|/ɪkˈspəʊz/|v.|暴露；揭露|Don't expose your skin to the sun.
express|/ɪkˈspres/|v./adj.|表达；明确的；快递|express one's feelings
extend|/ɪkˈstend/|v.|延伸；扩展|extend the deadline
extra|/ˈekstrə/|adj./adv.|额外的|extra work
extreme|/ɪkˈstriːm/|adj./n.|极端的；极端|extreme weather
face|/feɪs/|n./v.|脸；面对|face a challenge
facility|/fəˈsɪləti/|n.|设施|sports facilities
factor|/ˈfæktə/|n.|因素|a key factor
factory|/ˈfæktri/|n.|工厂|a car factory
fail|/feɪl/|v.|失败；不及格|Don't be afraid to fail.
fair|/feə/|adj.|公平的；晴朗的|a fair decision
faith|/feɪθ/|n.|信念；信仰|have faith in
fall|/fɔːl/|v./n.|落下；秋天|The leaves fall in autumn.
false|/fɔːls/|adj.|错误的；假的|a false statement
fame|/feɪm/|n.|名声|rise to fame
family|/ˈfæməli/|n.|家庭|my family
famous|/ˈfeɪməs/|adj.|著名的|a famous singer
fan|/fæn/|n.|风扇；迷|a football fan
fancy|/ˈfænsi/|adj./v.|花哨的；想象；喜欢|a fancy dress
far|/fɑː/|adj./adv.|远的|How far is it?
farm|/fɑːm/|n./v.|农场；耕作|a wheat farm
fashion|/ˈfæʃn/|n.|时尚|in fashion
fast|/fɑːst/|adj./adv.|快的|a fast train
fat|/fæt/|adj./n.|胖的；脂肪|too much fat
fate|/feɪt/|n.|命运|accept one's fate
father|/ˈfɑːðə/|n.|父亲|my father
fault|/fɔːlt/|n.|过错；故障|It's my fault.
favour|/ˈfeɪvə/|n./v.|恩惠；偏爱|do someone a favour
fear|/fɪə/|n./v.|恐惧；害怕|He feared the worst.
feature|/ˈfiːtʃə/|n./v.|特征；以……为特色|The city features many parks.
fee|/fiː/|n.|费用|a tuition fee
feed|/fiːd/|v.|喂养|feed the baby
feel|/fiːl/|v.|感觉；摸|I feel happy.
fellow|/ˈfeləʊ/|n./adj.|同伴；伙伴的|my fellow students
female|/ˈfiːmeɪl/|adj./n.|女性的；女性|a female worker
fence|/fens/|n.|栅栏|behind the fence
fever|/ˈfiːvə/|n.|发烧|have a fever
few|/fjuː/|adj.|很少的|a few books
field|/fiːld/|n.|田地；领域|in the field of science
fierce|/fɪəs/|adj.|凶猛的；激烈的|a fierce competition
fight|/faɪt/|v./n.|战斗；打架|fight for freedom
figure|/ˈfɪɡə/|n./v.|数字；人物；图形；弄清楚|figure out the truth
file|/faɪl/|n./v.|文件；归档|a computer file
fill|/fɪl/|v.|填满|Fill in the form.
film|/fɪlm/|n.|电影；胶卷|watch a film
final|/ˈfaɪnl/|adj.|最终的|the final exam
finance|/ˈfaɪnæns/|n./v.|财政；资助|personal finance
find|/faɪnd/|v.|找到；发现|I can't find my keys.
fine|/faɪn/|adj./v.|好的；罚款|a fine day
finger|/ˈfɪŋɡə/|n.|手指|point with a finger
finish|/ˈfɪnɪʃ/|v.|完成|Finish your homework.
fire|/ˈfaɪə/|n./v.|火；解雇|The house caught fire.
firm|/fɜːm/|n./adj.|公司；坚定的|a firm decision
first|/fɜːst/|num./adj.|第一；首先|first of all
fit|/fɪt/|v./adj.|合适；健康的|The clothes fit well.
fix|/fɪks/|v.|修理；固定|fix the bike
flag|/flæɡ/|n.|旗帜|raise the flag
flat|/flæt/|adj./n.|平的；公寓|a flat surface
flavour|/ˈfleɪvə/|n.|味道|a sweet flavour
flee|/fliː/|v.|逃跑|The villagers fled.
flight|/flaɪt/|n.|飞行；航班|a direct flight
float|/fləʊt/|v.|漂浮|The boat floated on the river.
flood|/flʌd/|n./v.|洪水；淹没|The village was flooded.
floor|/flɔː/|n.|地板；楼层|on the third floor
flour|/ˈflaʊə/|n.|面粉|wheat flour
flow|/fləʊ/|v./n.|流动；流量|The river flows east.
flower|/ˈflaʊə/|n.|花|beautiful flowers
focus|/ˈfəʊkəs/|v./n.|集中；焦点|focus on the task
fog|/fɒɡ/|n.|雾|a thick fog
folks|/fəʊks/|n.|人们；家人|Hello, folks!
follow|/ˈfɒləʊ/|v.|跟随；遵循|Follow the instructions.
forbid|/fəˈbɪd/|v.|禁止|Smoking is forbidden here.
force|/fɔːs/|n./v.|力量；迫使|by force
foreign|/ˈfɒrən/|adj.|外国的|foreign language
forget|/fəˈɡet/|v.|忘记|Don't forget your keys.
form|/fɔːm/|n./v.|形式；形成；表格|fill out a form
formal|/ˈfɔːml/|adj.|正式的|a formal meeting
former|/ˈfɔːmə/|adj.|以前的；前者|the former president
forth|/fɔːθ/|adv.|向前|and so forth
fortune|/ˈfɔːtʃuːn/|n.|财富；运气|make a fortune
forward|/ˈfɔːwəd/|adv./v.|向前；转寄|look forward to
found|/faʊnd/|v.|建立|The company was founded in 1990.
foundation|/faʊnˈdeɪʃn/|n.|基础；基金会|lay a foundation
four|/fɔː/|num.|四|four seasons
free|/friː/|adj.|自由的；免费的|free time
freedom|/ˈfriːdəm/|n.|自由|freedom of speech
freeze|/friːz/|v.|冻结；结冰|The lake froze over.
frequent|/ˈfriːkwənt/|adj.|频繁的|frequent visits
fresh|/freʃ/|adj.|新鲜的|fresh air
friend|/frend/|n.|朋友|a close friend
frighten|/ˈfraɪtn/|v.|使害怕|The loud noise frightened the baby.
front|/frʌnt/|n./adj.|前面；前面的|in front of the building
fruit|/fruːt/|n.|水果|tropical fruit
full|/fʊl/|adj.|满的；完整的|a full moon
fun|/fʌn/|n./adj.|乐趣；有趣的|have fun
function|/ˈfʌŋkʃn/|n./v.|功能；运作|the function of the heart
fund|/fʌnd/|n./v.|资金；资助|raise funds
fundamental|/ˌfʌndəˈmentl/|adj.|基本的；根本的|a fundamental principle
funny|/ˈfʌni/|adj.|滑稽的|a funny story
furniture|/ˈfɜːnɪtʃə/|n.|家具|new furniture
further|/ˈfɜːðə/|adv./adj.|进一步；更远的|further study
future|/ˈfjuːtʃə/|n.|未来|in the future
gain|/ɡeɪn/|v./n.|获得；增加|gain experience
game|/ɡeɪm/|n.|游戏；比赛|a basketball game
gap|/ɡæp/|n.|差距；缺口|the generation gap
garage|/ˈɡærɑːʒ/|n.|车库|a car garage
garden|/ɡɑːdn/|n.|花园|a beautiful garden
gas|/ɡæs/|n.|气体；汽油|natural gas
gate|/ɡeɪt/|n.|大门|the school gate
general|/ˈdʒenrəl/|adj.|总的；普遍的|in general
generation|/ˌdʒenəˈreɪʃn/|n.|一代|the younger generation
generous|/ˈdʒenərəs/|adj.|慷慨的|a generous donation
gentle|/ˈdʒentl/|adj.|温柔的|a gentle voice
genuine|/ˈdʒenjuɪn/|adj.|真正的；真诚的|genuine interest
gesture|/ˈdʒestʃə/|n.|手势；姿态|a friendly gesture
get|/ɡet/|v.|得到；变得|Get up early.
gift|/ɡɪft/|n.|礼物；天赋|a birthday gift
giraffe|/dʒəˈrɑːf/|n.|长颈鹿|a tall giraffe
girl|/ɡɜːl/|n.|女孩|a little girl
give|/ɡɪv/|v.|给|Give me a hand.
glad|/ɡlæd/|adj.|高兴的|I'm glad to hear that.
glance|/ɡlɑːns/|v./n.|瞥一眼|take a glance at
glass|/ɡlɑːs/|n.|玻璃；玻璃杯|a glass of water
global|/ˈɡləʊbl/|adj.|全球的|global warming
glory|/ˈɡlɔːri/|n.|荣耀|win glory
glove|/ɡlʌv/|n.|手套|a pair of gloves
goal|/ɡəʊl/|n.|目标；球门|score a goal
gold|/ɡəʊld/|n./adj.|金；金色的|a gold medal
good|/ɡʊd/|adj.|好的|a good idea
govern|/ˈɡʌvən/|v.|治理；统治|govern a country
government|/ˈɡʌvənmənt/|n.|政府|the local government
grade|/ɡreɪd/|n./v.|年级；等级；评分|in grade three
gradually|/ˈɡrædʒuəli/|adv.|逐渐地|The weather gradually improved.
graduate|/ˈɡrædʒueɪt/|v./n.|毕业；毕业生|graduate from university
grain|/ɡreɪn/|n.|谷物；颗粒|food grains
grand|ɡrænd|adj.|宏伟的；盛大的|a grand building
grant|/ɡrɑːnt/|v./n.|授予；准许；助学金|grant a request
grass|/ɡrɑːs/|n.|草|green grass
grateful|/ˈɡreɪtfl/|adj.|感激的|I'm grateful to you.
great|ɡreɪt|adj.|伟大的；极好的|a great success
greedy|/ˈɡriːdi/|adj.|贪婪的|a greedy person
green|ɡriːn|adj./n.|绿色的；绿色|green tea
greet|/ɡriːt/|v.|问候|She greeted me warmly.
grey|ɡreɪ|adj./n.|灰色的|grey hair
guard|/ɡɑːd/|n./v.|守卫；警戒|The guard is on duty.
guess|/ɡes/|v./n.|猜测|Take a guess.
guest|/ɡest/|n.|客人|a welcome guest
guide|/ɡaɪd/|n./v.|向导；指导|a tour guide
guilty|/ˈɡɪlti/|adj.|有罪的；内疚的|feel guilty
habit|/ˈhæbɪt/|n.|习惯|a good habit
hair|/heə/|n.|头发|long hair
half|/hɑːf/|n./adj.|一半|half an hour
hall|/hɔːl/|n.|大厅|the town hall
hand|/hænd/|n./v.|手；递给|Give me your hand.
handle|/ˈhændl/|v./n.|处理；把手|Handle with care.
hang|/hæŋ/|v.|悬挂；绞死|Hang the picture on the wall.
happen|/ˈhæpən/|v.|发生|What happened?
happy|/ˈhæpi/|adj.|快乐的|happy birthday
hard|/hɑːd/|adj./adv.|困难的；努力地|work hard
hardly|/ˈhɑːdli/|adv.|几乎不|I can hardly believe it.
harm|/hɑːm/|n./v.|伤害|Smoking does harm to health.
harvest|/ˈhɑːvɪst/|n./v.|收获|a good harvest
hate|/heɪt/|v.|讨厌|I hate lying.
head|/hed/|n./v.|头；前往|Use your head.
health|/helθ/|n.|健康|good health
hear|/hɪə/|v.|听见|I can't hear you.
heart|/hɑːt/|n.|心脏；心|from the bottom of my heart
heat|/hiːt/|n./v.|热；加热|Heat the water.
heaven|/ˈhevn/|n.|天堂|in heaven
heavy|/ˈhevi/|adj.|重的|a heavy bag
height|/haɪt/|n.|高度|What's your height?
held|/held/|v.|握住(hold过去式)|The meeting was held yesterday.
help|/help/|v./n.|帮助|Can you help me?
her|/hɜː/|pron.|她；她的|Her book is new.
here|/hɪə/|adv.|这里|Come here.
hero|/ˈhɪərəʊ/|n.|英雄|a national hero
hesitate|/ˈhezɪteɪt/|v.|犹豫|Don't hesitate to ask.
hide|/haɪd/|v.|隐藏|Hide and seek.
high|/haɪ/|adj./adv.|高的|a high mountain
hill|/hɪl/|n.|小山|climb a hill
hint|/hɪnt/|n./v.|暗示；提示|Give me a hint.
hire|/ˈhaɪə/|v.|雇用；租用|hire a car
history|/ˈhɪstri/|n.|历史|Chinese history
hit|/hɪt/|v./n.|打击；热门|a hit song
hold|/həʊld/|v.|握住；举行|Hold the line, please.
hole|/həʊl/|n.|洞|dig a hole
holiday|/ˈhɒlədeɪ/|n.|假期|summer holiday
home|/həʊm/|n./adv.|家；在家|go home
honest|/ˈɒnɪst/|adj.|诚实的|an honest man
honour|/ˈɒnə/|n./v.|荣誉；尊敬|in honour of
hope|/həʊp/|n./v.|希望|I hope so.
horizon|/həˈraɪzn/|n.|地平线|on the horizon
horrible|/ˈhɒrəbl/|adj.|可怕的|a horrible dream
horse|/hɔːs/|n.|马|ride a horse
hospital|/ˈhɒspɪtl/|n.|医院|in hospital
host|/həʊst/|n./v.|主人；主持|host a show
hot|/hɒt/|adj.|热的|a hot day
hotel|/həʊˈtel/|n.|旅馆|stay at a hotel
hour|/ˈaʊə/|n.|小时|half an hour
house|/haʊs/|n.|房子|a new house
however|/haʊˈevə/|adv.|然而|However, we disagree.
huge|/hjuːdʒ/|adj.|巨大的|a huge success
human|/ˈhjuːmən/|n./adj.|人类；人类的|human rights
humble|/ˈhʌmbl/|adj.|谦逊的|a humble person
humour|/ˈhjuːmə/|n.|幽默|a sense of humour
hundred|/ˈhʌndrəd/|num.|一百|hundreds of people
hunger|/ˈhʌŋɡə/|n.|饥饿|die of hunger
hurry|/ˈhʌri/|v./n.|匆忙|Hurry up!
hurt|/hɜːt/|v.|伤害；疼痛|My leg hurts.
husband|/ˈhʌzbənd/|n.|丈夫|her husband
idea|/aɪˈdɪə/|n.|想法；主意|a good idea
identify|/aɪˈdentɪfaɪ/|v.|识别；确认|identify the problem
idle|/ˈaɪdl/|adj.|空闲的；懒散的|idle time
if|/ɪf/|conj.|如果；是否|If I were you...
ignore|/ɪɡˈnɔː/|v.|忽视|Don't ignore advice.
ill|/ɪl/|adj.|生病的|fall ill
illness|/ˈɪlnəs/|n.|疾病|a serious illness
imagine|/ɪˈmædʒɪn/|v.|想象|Imagine living on the moon.
immediate|/ɪˈmiːdiət/|adj.|立即的|an immediate reply
impact|/ˈɪmpækt/|n./v.|影响；冲击|a great impact
imply|/ɪmˈplaɪ/|v.|暗示|What do you imply?
import|/ɪmˈpɔːt/|v./n.|进口|import goods
importance|/ɪmˈpɔːtns/|n.|重要性|the importance of education
important|/ɪmˈpɔːtnt/|adj.|重要的|an important decision
impossible|/ɪmˈpɒsəbl/|adj.|不可能的|It's impossible.
impress|/ɪmˈpres/|v.|使印象深刻|I was impressed by his speech.
improve|/ɪmˈpruːv/|v.|改善；提高|improve your English
include|/ɪnˈkluːd/|v.|包括|The price includes everything.
income|/ˈɪnkʌm/|n.|收入|a steady income
increase|/ɪnˈkriːs/|v./n.|增加|The population increased.
indeed|/ɪnˈdiːd/|adv.|确实|He is indeed a hero.
independent|/ˌɪndɪˈpendənt/|adj.|独立的|an independent thinker
indicate|/ˈɪndɪkeɪt/|v.|表明；指出|The data indicates a trend.
individual|/ˌɪndɪˈvɪdʒuəl/|n./adj.|个人；个别的|individual rights
industry|/ˈɪndəstri/|n.|工业；行业|the film industry
influence|/ˈɪnfluəns/|n./v.|影响|a positive influence
inform|/ɪnˈfɔːm/|v.|通知|Please inform me of the news.
initial|/ɪˈnɪʃl/|adj.|最初的|the initial stage
injure|/ˈɪndʒə/|v.|伤害|He injured his leg.
injury|/ˈɪndʒəri/|n.|伤害|serious injuries
inner|/ˈɪnə/|adj.|内部的|inner peace
innocent|/ˈɪnəsnt/|adj.|无辜的|He is innocent.
insist|/ɪnˈsɪst/|v.|坚持|She insisted on going.
inspect|/ɪnˈspekt/|v.|检查|inspect the building
inspire|/ɪnˈspaɪə/|v.|激励；启发|His story inspired me.
install|/ɪnˈstɔːl/|v.|安装|install software
instance|/ˈɪnstəns/|n.|例子|for instance
instead|/ɪnˈsted/|adv.|代替|Instead, he stayed home.
institute|/ˈɪnstɪtjuːt/|n.|学院；研究所|a research institute
instruction|/ɪnˈstrʌkʃn/|n.|指示；说明|Follow the instructions.
instrument|/ˈɪnstrəmənt/|n.|仪器；乐器|a musical instrument
insult|/ɪnˈsʌlt/|v./n.|侮辱|Don't insult others.
insure|/ɪnˈʃʊə/|v.|投保|insure the house
intend|/ɪnˈtend/|v.|打算|I intend to stay.
interest|/ˈɪntrəst/|n./v.|兴趣；利益|have an interest in
international|/ˌɪntəˈnæʃnəl/|adj.|国际的|international trade
internet|/ˈɪntənet/|n.|互联网|on the internet
interpret|/ɪnˈtɜːprɪt/|v.|解释；口译|interpret the meaning
interview|/ˈɪntəvjuː/|n./v.|面试；采访|a job interview
introduce|/ˌɪntrəˈdjuːs/|v.|介绍；引进|Allow me to introduce myself.
invent|/ɪnˈvent/|v.|发明|Who invented television?
invest|/ɪnˈvest/|v.|投资|invest money
invite|/ɪnˈvaɪt/|v.|邀请|invite a friend
involve|/ɪnˈvɒlv/|v.|涉及；使参与|The job involves travel.
iron|/ˈaɪən/|n./v.|铁；熨烫|an iron gate
island|/ˈaɪlənd/|n.|岛|a tropical island
issue|/ˈɪʃuː/|n./v.|问题；发行|a key issue
item|/ˈaɪtəm/|n.|项目；物品|an important item
jacket|/ˈdʒækɪt/|n.|夹克|a warm jacket
job|/dʒɒb/|n.|工作|find a job
join|/dʒɔɪn/|v.|加入；连接|join the club
joint|/dʒɔɪnt/|adj./n.|共同的；关节|a joint effort
joke|/dʒəʊk/|n./v.|笑话|tell a joke
journey|/ˈdʒɜːni/|n.|旅程|a long journey
joy|/dʒɔɪ/|n.|快乐|with joy
judge|/dʒʌdʒ/|v./n.|判断；法官|judge by appearance
juice|/dʒuːs/|n.|果汁|orange juice
jump|/dʒʌmp/|v./n.|跳|jump over the fence
junior|/ˈdʒuːniə/|adj./n.|年少的；下级|a junior high school
just|/dʒʌst/|adv./adj.|刚刚；仅仅；公正的|Just a moment.
keep|/kiːp/|v.|保持；保存|Keep quiet.
key|/kiː/|n./adj.|钥匙；关键；关键的|the key to success
kick|/kɪk/|v./n.|踢|kick the ball
kill|/kɪl/|v.|杀死|The frost killed the flowers.
kind|/kaɪnd/|n./adj.|种类；善良的|a kind person
king|/kɪŋ/|n.|国王|the king of the country
kiss|/kɪs/|v./n.|吻|kiss goodbye
kitchen|/ˈkɪtʃɪn/|n.|厨房|in the kitchen
knee|/niː/|n.|膝盖|fall on one's knees
knife|/naɪf/|n.|刀|a sharp knife
knock|/nɒk/|v./n.|敲|Knock at the door.
know|/nəʊ/|v.|知道|I know him well.
knowledge|/ˈnɒlɪdʒ/|n.|知识|gain knowledge
lab|/læb/|n.|实验室|a chemistry lab
labour|/ˈleɪbə/|n.|劳动；劳工|manual labour
lack|/læk/|v./n.|缺乏|a lack of money
ladder|/ˈlædə/|n.|梯子|climb a ladder
lady|/ˈleɪdi/|n.|女士|a young lady
lake|/leɪk/|n.|湖|by the lake
land|/lænd/|n./v.|土地；着陆|The plane landed safely.
language|/ˈlæŋɡwɪdʒ/|n.|语言|foreign languages
large|/lɑːdʒ/|adj.|大的|a large number
last|/lɑːst/|adj./v.|最后的；持续|last night
late|/leɪt/|adj./adv.|迟的；晚|be late for school
later|/ˈleɪtə/|adv.|后来|See you later.
laugh|/lɑːf/|v./n.|笑|laugh out loud
launch|/lɔːntʃ/|v./n.|发射；发起|launch a rocket
law|/lɔː/|n.|法律|break the law
lawyer|/ˈlɔːjə/|n.|律师|a famous lawyer
lay|/leɪ/|v.|放置；产卵|lay the table
lazy|/ˈleɪzi/|adj.|懒惰的|a lazy boy
lead|/liːd/|v./n.|领导；导致|lead to success
leader|/ˈliːdə/|n.|领导者|a team leader
leaf|/liːf/|n.|叶子|autumn leaves
learn|/lɜːn/|v.|学习|learn from mistakes
least|/liːst/|adj./adv.|最少的|at least
leave|/liːv/|v.|离开；留下|Leave a message.
lecture|/ˈlektʃə/|n./v.|讲座；演讲|attend a lecture
left|/left/|adj./n.|左边的；离开|turn left
leg|/leɡ/|n.|腿|break a leg
legal|/ˈliːɡl/|adj.|合法的|a legal right
lend|/lend/|v.|借出|lend me a book
length|/leŋθ/|n.|长度|the length of the river
less|/les/|adj./adv.|较少的|less time
lesson|/ˈlesn/|n.|课；教训|learn a lesson
let|/let/|v.|让|Let me help you.
letter|/ˈletə/|n.|信；字母|write a letter
level|/ˈlevl/|n./adj.|水平；平坦的|a high level
library|/ˈlaɪbrəri/|n.|图书馆|in the library
license|/ˈlaɪsns/|n.|执照|a driving license
lie|/laɪ/|v./n.|躺；说谎；谎言|Tell the truth, don't lie.
life|/laɪf/|n.|生活；生命|school life
lift|/lɪft/|v./n.|举起；电梯|lift a box
light|/laɪt/|n./adj.|光；轻的|Turn on the light.
likely|/ˈlaɪkli/|adj./adv.|可能的|It's likely to rain.
limit|/ˈlɪmɪt/|n./v.|限制|speed limit
line|/laɪn/|n.|线；队伍|stand in line
link|/lɪŋk/|n./v.|联系；链接|a close link
lion|/ˈlaɪən/|n.|狮子|a fierce lion
list|/lɪst/|n./v.|清单；列出|make a list
listen|/ˈlɪsn/|v.|听|Listen carefully.
literature|/ˈlɪtrətʃə/|n.|文学|English literature
little|/ˈlɪtl/|adj.|小的；少的|a little boy
live|/lɪv/|v./adj.|生活；现场的|live in Beijing
load|/ləʊd/|n./v.|负载；装载|load the truck
loan|/ləʊn/|n./v.|贷款|take out a loan
local|/ˈləʊkl/|adj.|当地的|local people
lock|/lɒk/|v./n.|锁|Lock the door.
lonely|/ˈləʊnli/|adj.|孤独的|a lonely old man
long|/lɒŋ/|adj./adv.|长的；渴望|a long road
look|/lʊk/|v./n.|看；表情|look at the blackboard
loose|/luːs/|adj.|松的|a loose tooth
lose|/luːz/|v.|失去；输|Don't lose heart.
loss|/lɒs/|n.|损失|a great loss
lot|/lɒt/|n.|许多|a lot of people
loud|/laʊd/|adj./adv.|大声的|Don't speak so loud.
love|/lʌv/|n./v.|爱|Love your parents.
low|/ləʊ/|adj./adv.|低的|a low price
loyal|/ˈlɔɪəl/|adj.|忠诚的|a loyal friend
luck|/lʌk/|n.|运气|Good luck!
lunch|/lʌntʃ/|n.|午餐|have lunch
machine|/məˈʃiːn/|n.|机器|a washing machine
magazine|/ˌmæɡəˈziːn/|n.|杂志|a fashion magazine
mail|/meɪl/|n./v.|邮件；邮寄|send an email
main|/meɪn/|adj.|主要的|the main idea
maintain|/meɪnˈteɪn/|v.|维持；保养|maintain order
major|/ˈmeɪdʒə/|adj./n.|主要的；专业|a major problem
make|/meɪk/|v.|制作；使|make progress
male|/meɪl/|adj./n.|男性的|a male nurse
manage|/ˈmænɪdʒ/|v.|管理；设法做到|manage to do
manner|/ˈmænə/|n.|方式；礼貌|in a friendly manner
many|/ˈmeni/|adj.|许多的|many books
market|/ˈmɑːkɪt/|n.|市场|the stock market
marry|/ˈmæri/|v.|结婚|marry a doctor
master|/ˈmɑːstə/|n./v.|大师；掌握|master a skill
match|/mætʃ/|n./v.|比赛；匹配|a football match
material|/məˈtɪəriəl/|n.|材料|building materials
matter|/ˈmætə/|n./v.|事情；要紧|What's the matter?
mature|/məˈtʃʊə/|adj.|成熟的|a mature person
maximum|/ˈmæksɪməm/|n./adj.|最大量；最大的|the maximum speed
may|/meɪ/|v./n.|可以；五月|May I come in?
maybe|/ˈmeɪbi/|adv.|也许|Maybe he is right.
mayor|/meə/|n.|市长|the mayor of the city
meal|/miːl/|n.|一餐|a big meal
mean|/miːn/|v./adj.|意味着；吝啬的|What do you mean?
meaning|/ˈmiːnɪŋ/|n.|意义|the meaning of life
measure|/ˈmeʒə/|v./n.|测量；措施|measure the length
meat|/miːt/|n.|肉|lean meat
meet|/miːt/|v.|遇见；满足|Nice to meet you.
meeting|/ˈmiːtɪŋ/|n.|会议|attend a meeting
member|/ˈmembə/|n.|成员|a family member
memory|/ˈmeməri/|n.|记忆|a good memory
mental|/ˈmentl/|adj.|精神的；智力的|mental health
mention|/ˈmenʃn/|v./n.|提到|Don't mention it.
menu|/ˈmenjuː/|n.|菜单|look at the menu
mercy|/ˈmɜːsi/|n.|仁慈|show mercy
mere|/mɪə/|adj.|仅仅的|a mere child
merit|/ˈmerɪt/|n.|优点；价值|the merit of the plan
message|/ˈmesɪdʒ/|n.|信息|leave a message
method|/ˈmeθəd/|n.|方法|a new method
middle|/ˈmɪdl/|n./adj.|中间|in the middle of
might|/maɪt/|v./n.|可能；力量|It might rain.
mild|/maɪld/|adj.|温和的|a mild climate
million|/ˈmɪljən/|num.|百万|millions of people
mind|/maɪnd/|n./v.|头脑；介意|Never mind.
minimum|/ˈmɪnɪməm/|n./adj.|最小量；最小的|the minimum wage
minister|/ˈmɪnɪstə/|n.|部长；牧师|the Prime Minister
minor|/ˈmaɪnə/|adj./n.|次要的；未成年人|a minor problem
minute|/ˈmɪnɪt/|n.|分钟|Wait a minute.
miracle|/ˈmɪrəkl/|n.|奇迹|a medical miracle
mirror|/ˈmɪrə/|n.|镜子|look in the mirror
miss|/mɪs/|v.|错过；想念|I miss my family.
mistake|/mɪˈsteɪk/|n.|错误|make a mistake
mix|/mɪks/|v.|混合|Mix the ingredients.
mobile|/ˈməʊbaɪl/|adj.|可移动的|a mobile phone
model|/ˈmɒdl/|n.|模型；模特|a fashion model
modern|/ˈmɒdn/|adj.|现代的|modern technology
modest|/ˈmɒdɪst/|adj.|谦虚的|a modest person
moment|/ˈməʊmənt/|n.|时刻|at the moment
moral|/ˈmɒrəl/|adj./n.|道德的；寓意|moral values
more|/mɔː/|adj./adv.|更多的|more and more
morning|/ˈmɔːnɪŋ/|n.|早晨|good morning
most|/məʊst/|adj./adv.|最多的|most people
mother|/ˈmʌðə/|n.|母亲|my mother
motion|/ˈməʊʃn/|n.|运动；提议|set in motion
motor|/ˈməʊtə/|n.|发动机|a motor car
mountain|/ˈmaʊntən/|n.|山|climb a mountain
mouse|/maʊs/|n.|老鼠；鼠标|a computer mouse
mouth|/maʊθ/|n.|嘴|open your mouth
move|/muːv/|v.|移动；感动|Move forward.
movie|/ˈmuːvi/|n.|电影|watch a movie
much|/mʌtʃ/|adj./adv.|许多|Thank you very much.
multiple|/ˈmʌltɪpl/|adj.|多重的；多样的|multiple choices
murder|/ˈmɜːdə/|n./v.|谋杀|a murder case
muscle|/ˈmʌsl/|n.|肌肉|stretch the muscles
museum|/mjuˈziːəm/|n.|博物馆|a history museum
music|/ˈmjuːzɪk/|n.|音乐|pop music
must|/mʌst/|v.|必须|You must finish it.
mutual|/ˈmjuːtʃuəl/|adj.|相互的|mutual respect
mystery|/ˈmɪstri/|n.|谜；神秘|a murder mystery
nail|/neɪl/|n./v.|钉子；指甲|hit the nail
name|/neɪm/|n./v.|名字；命名|What's your name?
narrow|/ˈnærəʊ/|adj.|窄的|a narrow street
nation|/ˈneɪʃn/|n.|国家；民族|the Chinese nation
national|/ˈnæʃnəl/|adj.|国家的|national day
native|/ˈneɪtɪv/|adj./n.|本地的；母语者|native language
nature|/ˈneɪtʃə/|n.|自然；本性|human nature
near|/nɪə/|prep./adj.|靠近|near the school
nearly|/ˈnɪəli/|adv.|几乎|nearly finished
necessary|/ˈnesəsəri/|adj.|必要的|It is necessary to sleep.
need|/niːd/|v./n.|需要|I need help.
negative|/ˈneɡətɪv/|adj.|消极的；否定的|a negative attitude
neglect|/nɪˈɡlekt/|v.|忽视|Don't neglect your health.
neighbour|/ˈneɪbə/|n.|邻居|our next-door neighbour
neither|/ˈnaɪðə/|adj./adv.|两者都不|Neither is right.
nerve|/nɜːv/|n.|神经；勇气|lose one's nerve
nest|/nest/|n.|鸟巢|a bird's nest
net|/net/|n.|网；净额|the Internet
network|/ˈnetwɜːk/|n.|网络|a social network
never|/ˈnevə/|adv.|从不|I never lie.
new|/njuː/|adj.|新的|a new idea
news|/njuːz/|n.|新闻|the evening news
newspaper|/ˈnjuːzpeɪpə/|n.|报纸|read the newspaper
next|/nekst/|adj./adv.|下一个|next week
nice|/naɪs/|adj.|好的；友善的|Nice to see you.
noble|/ˈnəʊbl/|adj.|高尚的；贵族的|a noble deed
noise|/nɔɪz/|n.|噪音|make a noise
none|/nʌn/|pron.|没有一个|None of them came.
normal|/ˈnɔːml/|adj.|正常的|normal temperature
north|/nɔːθ/|n./adj.|北方|in the north of China
nose|/nəʊz/|n.|鼻子|hold your nose
not|/nɒt/|adv.|不|I do not know.
note|/nəʊt/|n./v.|笔记；注意|take notes
nothing|/ˈnʌθɪŋ/|pron.|没有什么|Nothing happened.
notice|/ˈnəʊtɪs/|v./n.|注意；通知|Notice the difference.
novel|/ˈnɒvl/|n./adj.|小说；新颖的|a famous novel
now|/naʊ/|adv.|现在|right now
nowadays|/ˈnaʊədeɪz/|adv.|如今|Nowadays, people use phones.
number|/ˈnʌmbə/|n.|数字；号码|phone number
nurse|/nɜːs/|n./v.|护士；护理|a hospital nurse
nut|/nʌt/|n.|坚果|a walnut
obey|/əˈbeɪ/|v.|服从|obey the rules
object|/ˈɒbdʒɪkt/|n./v.|物体；目标；反对|a small object
observe|/əbˈzɜːv/|v.|观察；遵守|observe the rules
obtain|/əbˈteɪn/|v.|获得|obtain a visa
obvious|/ˈɒbviəs/|adj.|明显的|an obvious mistake
occasion|/əˈkeɪʒn/|n.|场合|on occasion
occupy|/ˈɒkjupaɪ/|v.|占据；占用|occupy the seat
occur|/əˈkɜː/|v.|发生；出现|The accident occurred yesterday.
ocean|/ˈəʊʃn/|n.|海洋|the Pacific Ocean
offer|/ˈɒfə/|v./n.|提供；报价|offer help
office|/ˈɒfɪs/|n.|办公室|in the office
officer|/ˈɒfɪsə/|n.|官员；军官|a police officer
official|/əˈfɪʃl/|adj./n.|官方的；官员|an official statement
often|/ˈɒfn/|adv.|经常|How often?
oil|/ɔɪl/|n.|油|olive oil
old|/əʊld/|adj.|老的；旧的|an old friend
omit|/əˈmɪt/|v.|省略|Don't omit any details.
once|/wʌns/|adv./conj.|一次；一旦|once a week
one|/wʌn/|num.|一|one book
only|/ˈəʊnli/|adv./adj.|仅仅；唯一的|only one
open|/ˈəʊpən/|v./adj.|打开；开着的|Open the window.
operate|/ˈɒpəreɪt/|v.|操作；手术；经营|operate a machine
opinion|/əˈpɪnjən/|n.|观点|in my opinion
opportunity|/ˌɒpəˈtjuːnəti/|n.|机会|a good opportunity
oppose|/əˈpəʊz/|v.|反对|oppose a plan
option|/ˈɒpʃn/|n.|选择|There is no other option.
order|/ˈɔːdə/|n./v.|命令；顺序；订购|in order to
ordinary|/ˈɔːdnri/|adj.|普通的|an ordinary day
organize|/ˈɔːɡənaɪz/|v.|组织|organize a party
origin|/ˈɒrɪdʒɪn/|n.|起源|a family of humble origin
original|/əˈrɪdʒənl/|adj.|原始的；独创的|an original idea
other|/ˈʌðə/|adj./pron.|其他的|the other day
ought|/ɔːt/|v.|应该|ought to do
out|/aʊt/|adv.|出去|go out
outcome|/ˈaʊtkʌm/|n.|结果|the final outcome
outdoor|/ˈaʊtdɔː/|adj.|户外的|outdoor activities
outer|/ˈaʊtə/|adj.|外部的|outer space
output|/ˈaʊtpʊt/|n.|输出；产量|increase output
outside|/ˌaʊtˈsaɪd/|n./adv.|外面|outside the house
outstanding|/aʊtˈstændɪŋ/|adj.|杰出的|an outstanding student
over|/ˈəʊvə/|prep./adv.|在……上方；结束|over the table
overcome|/ˌəʊvəˈkʌm/|v.|克服|overcome difficulties
owe|/əʊ/|v.|欠；归功于|owe money
own|/əʊn/|adj./v.|自己的；拥有|my own room
owner|/ˈəʊnə/|n.|所有者|the owner of the shop
pace|/peɪs/|n.|步伐|at a fast pace
pack|/pæk/|v./n.|打包；包|pack your bags
page|/peɪdʒ/|n.|页|turn the page
pain|/peɪn/|n.|疼痛|feel pain
paint|/peɪnt/|v./n.|绘画；油漆|paint a wall
pair|/peə/|n.|一对|a pair of shoes
palace|/ˈpælɪs/|n.|宫殿|the Forbidden City palace
pale|/peɪl/|adj.|苍白的|a pale face
pan|/pæn/|n.|平底锅|a frying pan
paper|/ˈpeɪpə/|n.|纸；论文|a piece of paper
parade|/pəˈreɪd/|n./v.|游行|a military parade
parent|/ˈpeərənt/|n.|父或母|my parents
park|/pɑːk/|n./v.|公园；停车|in the park
part|/pɑːt/|n.|部分；角色|take part in
partial|/ˈpɑːʃl/|adj.|部分的|a partial solution
participate|/pɑːˈtɪsɪpeɪt/|v.|参与|participate in the discussion
particular|/pəˈtɪkjələ/|adj.|特别的|in particular
partner|/ˈpɑːtnə/|n.|伙伴|a business partner
party|/ˈpɑːti/|n.|聚会；政党|a birthday party
pass|/pɑːs/|v.|通过；传递|pass the exam
passage|/ˈpæsɪdʒ/|n.|段落；通道|read the passage
passenger|/ˈpæsɪndʒə/|n.|乘客|a bus passenger
passion|/ˈpæʃn/|n.|激情|a passion for music
past|/pɑːst/|n./adj.|过去；过去的|in the past
path|/pɑːθ/|n.|小路；路径|the path to success
patient|/ˈpeɪʃnt/|n./adj.|病人；耐心的|Be patient.
pattern|/ˈpætn/|n.|模式；图案|a sentence pattern
pause|/pɔːz/|v./n.|暂停|Pause for a moment.
pay|/peɪ/|v.|支付|pay attention
peace|/piːs/|n.|和平|world peace
peak|/piːk/|n.|山峰；顶峰|the peak of the mountain
pen|/pen/|n.|钢笔|a ball-point pen
penalty|/ˈpenəlti/|n.|惩罚|a heavy penalty
pencil|/ˈpensl/|n.|铅笔|a pencil box
people|/ˈpiːpl/|n.|人们|young people
per|/pɜː/|prep.|每|per day
percent|/pəˈsent/|n.|百分之|ten percent
perfect|/ˈpɜːfɪkt/|adj.|完美的|practice makes perfect
perform|/pəˈfɔːm/|v.|表演；执行|perform on stage
performance|/pəˈfɔːməns/|n.|表演；表现|a wonderful performance
perhaps|/pəˈhæps/|adv.|也许|Perhaps he is right.
period|/ˈpɪəriəd/|n.|时期；句号|a long period
permanent|/ˈpɜːmənənt/|adj.|永久的|a permanent job
permit|/pəˈmɪt/|v./n.|允许；许可证|Smoking is not permitted.
person|/ˈpɜːsn/|n.|人|a nice person
personal|/ˈpɜːsnl/|adj.|个人的|personal information
persuade|/pəˈsweɪd/|v.|说服|persuade him to come
pet|/pet/|n.|宠物|a pet dog
phase|/feɪz/|n.|阶段|a new phase
phone|/fəʊn/|n./v.|电话|answer the phone
photo|/ˈfəʊtəʊ/|n.|照片|take a photo
phrase|/freɪz/|n.|短语|a useful phrase
physical|/ˈfɪzɪkl/|adj.|身体的；物理的|physical exercise
piano|/piˈænəʊ/|n.|钢琴|play the piano
pick|/pɪk/|v.|挑选；采摘|Pick a card.
picture|/ˈpɪktʃə/|n.|图画；照片|draw a picture
piece|/piːs/|n.|片；块|a piece of cake
pile|/paɪl/|n./v.|堆|a pile of books
pill|/pɪl/|n.|药丸|take a pill
pilot|/ˈpaɪlət/|n.|飞行员|a pilot's licence
pin|/pɪn/|n./v.|别针；固定|pin the notice
pink|/pɪŋk/|adj./n.|粉色的|a pink dress
pipe|/paɪp/|n.|管道|a water pipe
pity|/ˈpɪti/|n.|遗憾；同情|What a pity!
place|/pleɪs/|n./v.|地方；放置|in the first place
plan|/plæn/|n./v.|计划|make a plan
plane|/pleɪn/|n.|飞机|by plane
plant|/plɑːnt/|n./v.|植物；种植|plant trees
plastic|/ˈplæstɪk/|n./adj.|塑料|plastic bags
plate|/pleɪt/|n.|盘子|a dinner plate
play|/pleɪ/|v./n.|玩；播放；戏剧|play football
pleasant|/ˈpleznt/|adj.|愉快的|a pleasant trip
please|/pliːz/|v.|使高兴；请|Please sit down.
pleasure|/ˈpleʒə/|n.|快乐|with pleasure
plenty|/ˈplenti/|n.|大量|plenty of time
plot|/plɒt/|n.|情节；阴谋|the plot of the story
plough|/plaʊ/|n./v.|犁|plough the field
point|/pɔɪnt/|n./v.|点；指出|point out
police|/pəˈliːs/|n.|警察|call the police
policy|/ˈpɒləsi/|n.|政策|a new policy
polish|/ˈpɒlɪʃ/|v.|抛光；润色|polish your essay
polite|/pəˈlaɪt/|adj.|礼貌的|a polite answer
political|/pəˈlɪtɪkl/|adj.|政治的|political issues
pollute|/pəˈluːt/|v.|污染|pollute the air
poor|/pʊə/|adj.|贫穷的；可怜的|a poor family
popular|/ˈpɒpjələ/|adj.|受欢迎的|popular songs
population|/ˌpɒpjuˈleɪʃn/|n.|人口|the world population
port|/pɔːt/|n.|港口|a busy port
position|/pəˈzɪʃn/|n.|位置；职位|in a difficult position
positive|/ˈpɒzətɪv/|adj.|积极的；肯定的|a positive attitude
possess|/pəˈzes/|v.|拥有|possess a car
possible|/ˈpɒsəbl/|adj.|可能的|as soon as possible
post|/pəʊst/|n./v.|邮政；岗位；张贴|post a letter
pot|/pɒt/|n.|锅；罐|a flower pot
potato|/pəˈteɪtəʊ/|n.|土豆|potato chips
potential|/pəˈtenʃl/|n./adj.|潜力；潜在的|great potential
pound|/paʊnd/|n.|英镑；磅|ten pounds
power|/ˈpaʊə/|n.|力量；电力|solar power
practical|/ˈpræktɪkl/|adj.|实用的|practical experience
practice|/ˈpræktɪs/|n./v.|练习|practice speaking English
praise|/preɪz/|v./n.|表扬|in praise of
pray|/preɪ/|v.|祈祷|pray for peace
precious|/ˈpreʃəs/|adj.|珍贵的|precious time
predict|/prɪˈdɪkt/|v.|预测|predict the future
prefer|/prɪˈfɜː/|v.|更喜欢|I prefer tea to coffee.
prepare|/prɪˈpeə/|v.|准备|prepare for the exam
present|/ˈpreznt/|adj./n./v.|现在的；礼物；呈现|at present
preserve|/prɪˈzɜːv/|v.|保护；保存|preserve the environment
president|/ˈprezɪdənt/|n.|总统；校长|the president of the company
press|/pres/|v./n.|按；新闻界|press the button
pressure|/ˈpreʃə/|n.|压力|under pressure
pretend|/prɪˈtend/|v.|假装|He pretended to be ill.
pretty|/ˈprɪti/|adj./adv.|漂亮的；相当|a pretty girl
prevent|/prɪˈvent/|v.|阻止|prevent the disease
price|/praɪs/|n.|价格|a high price
pride|/praɪd/|n.|骄傲|take pride in
primary|/ˈpraɪməri/|adj.|主要的；初级的|primary school
principle|/ˈprɪnsəpl/|n.|原则|in principle
print|/prɪnt/|v./n.|打印|print the document
prior|/ˈpraɪə/|adj.|先前的|prior experience
prison|/ˈprɪzn/|n.|监狱|in prison
private|/ˈpraɪvət/|adj.|私人的|a private letter
prize|/praɪz/|n.|奖品|win a prize
probable|/ˈprɒbəbl/|adj.|很可能的|the probable cause
problem|/ˈprɒbləm/|n.|问题|solve a problem
process|/ˈprəʊses/|n./v.|过程；加工|the learning process
produce|/prəˈdjuːs/|v.|生产|produce goods
product|/ˈprɒdʌkt/|n.|产品|a new product
profession|/prəˈfeʃn/|n.|职业|a medical profession
professor|/prəˈfesə/|n.|教授|a university professor
profit|/ˈprɒfɪt/|n./v.|利润|make a profit
program|/ˈprəʊɡræm/|n.|程序；节目|a computer program
progress|/ˈprəʊɡres/|n./v.|进步|make progress
project|/ˈprɒdʒekt/|n.|项目；工程|a research project
promise|/ˈprɒmɪs/|n./v.|承诺|keep a promise
promote|/prəˈməʊt/|v.|促进；晋升|promote growth
proof|/pruːf/|n.|证据|There is no proof.
proper|/ˈprɒpə/|adj.|适当的|in a proper way
property|/ˈprɒpəti/|n.|财产；性质|private property
propose|/prəˈpəʊz/|v.|提议|propose a plan
protect|/prəˈtekt/|v.|保护|protect the environment
protest|/prəˈtest/|v./n.|抗议|protest against the war
proud|/praʊd/|adj.|自豪的|be proud of
prove|/pruːv/|v.|证明|prove one's innocence
provide|/prəˈvaɪd/|v.|提供|provide food
public|/ˈpʌblɪk/|adj./n.|公共的；公众|in public
publish|/ˈpʌblɪʃ/|v.|出版；公布|publish a book
pull|/pʊl/|v.|拉|Pull the door open.
punctual|/ˈpʌŋktʃuəl/|adj.|准时的|Be punctual.
punish|/ˈpʌnɪʃ/|v.|惩罚|punish the thief
pupil|/ˈpjuːpl/|n.|小学生；瞳孔|a primary school pupil
purchase|/ˈpɜːtʃəs/|v./n.|购买|purchase goods
pure|/pjʊə/|adj.|纯净的|pure water
purpose|/ˈpɜːpəs/|n.|目的|on purpose
pursue|/pəˈsjuː/|v.|追求|pursue a dream
push|/pʊʃ/|v.|推|Push the door.
put|/pʊt/|v.|放|Put it on the table.
puzzle|/ˈpʌzl/|n./v.|谜；使困惑|a crossword puzzle
quality|/ˈkwɒləti/|n.|质量|high quality
quantity|/ˈkwɒntəti/|n.|数量|a large quantity
quarrel|/ˈkwɒrəl/|v./n.|争吵|quarrel with a friend
question|/ˈkwestʃən/|n./v.|问题；质疑|ask a question
quick|/kwɪk/|adj.|快的|a quick answer
quiet|/ˈkwaɪət/|adj.|安静的|Keep quiet.
quit|/kwɪt/|v.|放弃；辞职|quit smoking
quite|/kwaɪt/|adv.|相当|quite good
quote|/kwəʊt/|v./n.|引用|quote a famous saying
race|/reɪs/|n./v.|比赛；种族|a horse race
radio|/ˈreɪdiəʊ/|n.|收音机|listen to the radio
raise|/reɪz/|v.|举起；提高；筹集|raise money
range|/reɪndʒ/|n./v.|范围|a wide range of
rank|/ræŋk/|n./v.|排名|rank first
rapid|/ˈræpɪd/|adj.|快速的|rapid development
rare|/reə/|adj.|罕见的|a rare bird
rate|reɪt|n./v.|比率；评价|the growth rate
rather|/ˈrɑːðə/|adv.|相当；宁愿|would rather
reach|riːtʃ|v.|到达；伸手够|reach the destination
read|riːd|v.|读|read a book
ready|/ˈredi/|adj.|准备好的|get ready
real|/riːl/|adj.|真实的|the real reason
realize|/ˈriːəlaɪz/|v.|意识到；实现|I realized my mistake.
really|/ˈriːəli/|adv.|真正地|I really like it.
reason|/ˈriːzn/|n.|原因；理性|the reason for
reasonable|/ˈriːznəbl/|adj.|合理的|a reasonable price
recall|/rɪˈkɔːl/|v.|回忆|recall the past
receive|/rɪˈsiːv/|v.|收到|receive a letter
recent|/ˈriːsnt/|adj.|最近的|in recent years
recognize|/ˈrekəɡnaɪz/|v.|认出；承认|I recognized him.
recommend|/ˌrekəˈmend/|v.|推荐|recommend a book
record|/ˈrekɔːd/|n./v.|记录；唱片|keep a record
recover|/rɪˈkʌvə/|v.|恢复|recover from illness
reduce|/rɪˈdjuːs/|v.|减少|reduce costs
refer|/rɪˈfɜː/|v.|提及；参考|refer to a dictionary
reflect|/rɪˈflekt/|v.|反映；反射；思考|reflect on the past
refuse|/rɪˈfjuːz/|v.|拒绝|refuse an offer
regard|/rɪˈɡɑːd/|v.|认为；看待|regard as
region|/ˈriːdʒən/|n.|地区|a remote region
regret|/rɪˈɡret/|v./n.|后悔|I regret saying that.
regular|/ˈreɡjələ/|adj.|定期的；有规律的|regular exercise
reject|/rɪˈdʒekt/|v.|拒绝；驳回|reject a proposal
relate|/rɪˈleɪt/|v.|联系|relate to
relation|/rɪˈleɪʃn/|n.|关系|family relations
relative|/ˈrelətɪv/|n./adj.|亲戚；相对的|a close relative
relax|/rɪˈlæks/|v.|放松|Relax and enjoy.
release|/rɪˈliːs/|v./n.|释放；发布|release a film
relevant|/ˈreləvənt/|adj.|相关的|relevant information
reliable|/rɪˈlaɪəbl/|adj.|可靠的|a reliable friend
relief|/rɪˈliːf/|n.|宽慰；减轻|to my relief
religion|/rɪˈlɪdʒən/|n.|宗教|a world religion
rely|/rɪˈlaɪ/|v.|依赖|rely on parents
remain|/rɪˈmeɪn/|v.|保持；留下|remain silent
remark|/rɪˈmɑːk/|n./v.|评论|make a remark
remember|/rɪˈmembə/|v.|记得|Remember to call me.
remind|/rɪˈmaɪnd/|v.|提醒|remind me of the past
remote|/rɪˈməʊt/|adj.|遥远的|a remote village
remove|/rɪˈmuːv/|v.|移除|Remove your shoes.
repair|/rɪˈpeə/|v./n.|修理|repair the car
repeat|/rɪˈpiːt/|v.|重复|Repeat after me.
replace|/rɪˈpleɪs/|v.|取代；更换|replace the old one
reply|/rɪˈplaɪ/|v./n.|回答|reply to a letter
report|/rɪˈpɔːt/|v./n.|报道；报告|write a report
represent|/ˌreprɪˈzent/|v.|代表|represent the class
republic|/rɪˈpʌblɪk/|n.|共和国|the People's Republic
request|/rɪˈkwest/|n./v.|请求|make a request
require|/rɪˈkwaɪə/|v.|要求；需要|require attention
rescue|/ˈreskjuː/|v./n.|救援|rescue the victims
research|/rɪˈsɜːtʃ/|n./v.|研究|do research
reserve|/rɪˈzɜːv/|v./n.|预订；保留|reserve a table
resist|/rɪˈzɪst/|v.|抵抗|resist temptation
resource|/rɪˈsɔːs/|n.|资源|natural resources
respect|/rɪˈspekt/|n./v.|尊重|show respect
respond|/rɪˈspɒnd/|v.|回应|respond to the question
responsibility|/rɪˌspɒnsəˈbɪləti/|n.|责任|take responsibility
rest|rest|n./v.|休息；剩余|have a rest
restore|/rɪˈstɔː/|v.|恢复；修复|restore the building
restrict|/rɪˈstrɪkt/|v.|限制|restrict the number
result|/rɪˈzʌlt/|n./v.|结果|as a result
retire|/rɪˈtaɪə/|v.|退休|retire at 60
return|/rɪˈtɜːn/|v./n.|返回；归还|return home
reveal|/rɪˈviːl/|v.|揭示|reveal the truth
review|/rɪˈvjuː/|v./n.|复习；评论|review the lesson
revise|/rɪˈvaɪz/|v.|修订；复习|revise the plan
reward|/rɪˈwɔːd/|n./v.|奖励|as a reward
rich|/rɪtʃ/|adj.|富有的|a rich family
rid|/rɪd/|v.|摆脱|get rid of
ride|/raɪd/|v./n.|骑|ride a bike
right|/raɪt/|adj./n.|正确的；权利|You are right.
rise|/raɪz/|v./n.|上升|The sun rises.
risk|/rɪsk/|n./v.|风险|take a risk
rival|/ˈraɪvl/|n./v.|对手；竞争|a business rival
river|/ˈrɪvə/|n.|河流|cross the river
road|/rəʊd/|n.|道路|on the road
rob|/rɒb/|v.|抢劫|rob a bank
robot|/ˈrəʊbɒt/|n.|机器人|a service robot
rock|/rɒk/|n./v.|岩石；摇晃|a big rock
role|/rəʊl/|n.|角色|play a role
roll|/rəʊl/|v./n.|滚动；卷|roll the ball
roof|/ruːf/|n.|屋顶|on the roof
room|/ruːm/|n.|房间；空间|a sitting room
root|/ruːt/|n.|根|the root of the problem
rose|/rəʊz/|n.|玫瑰|a red rose
rough|/rʌf/|adj.|粗糙的；大致的|a rough estimate
round|/raʊnd/|adj./prep.|圆的；围绕|a round table
route|/ruːt/|n.|路线|a new route
routine|/ruːˈtiːn/|n.|例行公事|daily routine
row|/rəʊ/|n./v.|排；划船|a row of seats
rub|/rʌb/|v.|摩擦|rub your hands
ruin|/ˈruːɪn/|v./n.|毁坏；废墟|The rain ruined the picnic.
rule|/ruːl/|n./v.|规则；统治|follow the rules
run|/rʌn/|v.|跑；经营|run fast
rural|/ˈrʊrəl/|adj.|农村的|rural areas
sacrifice|/ˈsækrɪfaɪs/|v./n.|牺牲|sacrifice one's life
safe|/seɪf/|adj.|安全的|It's not safe.
sail|/seɪl/|v./n.|航行；帆|sail across the sea
salary|/ˈsæləri/|n.|薪水|a monthly salary
sale|/seɪl/|n.|销售；廉价出售|for sale
salt|/sɔːlt/|n.|盐|add salt
same|/seɪm/|adj.|相同的|the same as
sample|/ˈsɑːmpl/|n.|样品|a free sample
sand|/sænd/|n.|沙|a grain of sand
satisfy|/ˈsætɪsfaɪ/|v.|满足|satisfy the needs
save|/seɪv/|v.|拯救；节省|save money
say|/seɪ/|v.|说|What did you say?
scale|/skeɪl/|n.|规模；刻度|a large scale
scan|/skæn/|v.|扫描；浏览|scan the document
scarce|/skeəs/|adj.|稀缺的|scarce resources
scene|/siːn/|n.|场景；一幕|a beautiful scene
schedule|/ˈʃedjuːl/|n./v.|时间表|on schedule
scheme|/skiːm/|n.|计划；方案|a new scheme
scholar|/ˈskɒlə/|n.|学者|a famous scholar
school|/skuːl/|n.|学校|at school
science|/ˈsaɪəns/|n.|科学|modern science
scientific|/ˌsaɪənˈtɪfɪk/|adj.|科学的|scientific research
scientist|/ˈsaɪəntɪst/|n.|科学家|a famous scientist
score|/skɔː/|n./v.|分数；得分|score high
scratch|/skrætʃ/|v./n.|抓；刮|start from scratch
screen|/skriːn/|n.|屏幕|a computer screen
sea|/siː/|n.|海|by the sea
seal|/siːl/|n./v.|海豹；密封|seal the envelope
search|/sɜːtʃ/|v./n.|搜索|search for information
season|/ˈsiːzn/|n.|季节|four seasons
seat|/siːt/|n.|座位|take a seat
second|/ˈsekənd/|num./n.|第二；秒|a second chance
secret|/ˈsiːkrət/|n./adj.|秘密|a secret plan
section|/ˈsekʃn/|n.|部分；章节|the next section
secure|/sɪˈkjʊə/|adj./v.|安全的；获得|feel secure
see|/siː/|v.|看见|I see.
seek|/siːk/|v.|寻找|seek advice
seem|/siːm/|v.|似乎|He seems tired.
seize|/siːz/|v.|抓住|seize the opportunity
seldom|/ˈseldəm/|adv.|很少|He seldom goes out.
select|/sɪˈlekt/|v.|选择|select the best
self|/self/|n.|自我|self control
sell|/sel/|v.|卖|sell goods
send|/send/|v.|发送|send an email
senior|/ˈsiːniə/|adj./n.|年长的；高级的|senior high school
sense|/sens/|n./v.|感觉；意义|a sense of humour
sentence|/ˈsentəns/|n.|句子；判决|make a sentence
separate|/ˈseprət/|adj./v.|分开的；分离|separate the two
series|/ˈsɪəriːz/|n.|系列|a series of books
serious|/ˈsɪəriəs/|adj.|严肃的；严重的|a serious problem
serve|/sɜːv/|v.|服务；提供|serve the people
service|/ˈsɜːvɪs/|n.|服务|good service
set|/set/|v./n.|设置；一套|set a goal
settle|/ˈsetl/|v.|解决；定居|settle down
seven|/ˈsevn/|num.|七|seven days
several|/ˈsevrəl/|adj.|几个|several times
severe|/sɪˈvɪə/|adj.|严重的；严厉的|severe weather
shade|/ʃeɪd/|n.|阴凉；色度|in the shade
shadow|/ˈʃædəʊ/|n.|影子|cast a shadow
shake|/ʃeɪk/|v.|摇动|shake hands
shall|/ʃæl/|v.|将；应该|Shall we go?
shame|/ʃeɪm/|n.|羞耻|What a shame!
shape|/ʃeɪp/|n./v.|形状；塑造|in the shape of
share|/ʃeə/|v./n.|分享；份额|share the cake
sharp|/ʃɑːp/|adj.|锋利的；敏锐的|a sharp knife
sheet|/ʃiːt/|n.|一张；床单|a sheet of paper
shelf|/ʃelf/|n.|架子|on the shelf
shell|/ʃel/|n.|壳|a seashell
shelter|/ˈʃeltə/|n./v.|避难所；遮蔽|take shelter
shine|/ʃaɪn/|v.|发光|The sun shines.
ship|/ʃɪp/|n./v.|船；运输|by ship
shirt|/ʃɜːt/|n.|衬衫|a white shirt
shock|/ʃɒk/|n./v.|震惊|be shocked
shoe|/ʃuː/|n.|鞋|a pair of shoes
shoot|/ʃuːt/|v.|射击；拍摄|shoot a gun
shop|/ʃɒp/|n./v.|商店；购物|go shopping
short|/ʃɔːt/|adj.|短的|a short story
should|/ʃʊd/|v.|应该|You should study hard.
shoulder|/ˈʃəʊldə/|n.|肩膀|shoulder to shoulder
shout|/ʃaʊt/|v.|喊叫|Don't shout.
show|/ʃəʊ/|v./n.|展示|show me the way
shower|/ˈʃaʊə/|n.|淋浴；阵雨|take a shower
shut|/ʃʌt/|v.|关闭|Shut the window.
sick|/sɪk/|adj.|生病的|feel sick
side|/saɪd/|n.|边；方面|on the other side
sight|/saɪt/|n.|视力；景象|in sight
sign|/saɪn/|n./v.|标志；签名|sign your name
signal|/ˈsɪɡnəl/|n./v.|信号|a traffic signal
silence|/ˈsaɪləns/|n.|沉默|in silence
silent|/ˈsaɪlənt/|adj.|沉默的|Keep silent.
silk|/sɪlk/|n.|丝绸|a silk scarf
silly|/ˈsɪli/|adj.|愚蠢的|Don't be silly.
silver|/ˈsɪlvə/|n./adj.|银；银色的|a silver medal
similar|/ˈsɪmələ/|adj.|相似的|be similar to
simple|/ˈsɪmpl/|adj.|简单的|a simple question
since|/sɪns/|conj./prep.|自从；既然|since then
sincere|/sɪnˈsɪə/|adj.|真诚的|a sincere apology
sing|/sɪŋ/|v.|唱歌|sing a song
single|/ˈsɪŋɡl/|adj.|单一的|a single room
sink|/sɪŋk/|v.|下沉|The ship sank.
sir|/sɜː/|n.|先生|Yes, sir.
sister|/ˈsɪstə/|n.|姐妹|my elder sister
sit|/sɪt/|v.|坐|Sit down, please.
situation|/ˌsɪtʃuˈeɪʃn/|n.|情况|a difficult situation
size|/saɪz/|n.|尺寸|What size do you want?
skill|/skɪl/|n.|技能|a useful skill
skin|/skɪn/|n.|皮肤|skin care
skirt|/skɜːt/|n.|裙子|a long skirt
sky|/skaɪ/|n.|天空|in the sky
sleep|/sliːp/|v./n.|睡觉|sleep well
slice|/slaɪs/|n.|薄片|a slice of bread
slide|/slaɪd/|v./n.|滑动|slide down
slight|/slaɪt/|adj.|轻微的|a slight change
slow|/sləʊ/|adj.|慢的|a slow train
small|/smɔːl/|adj.|小的|a small town
smart|/smɑːt/|adj.|聪明的|a smart phone
smell|/smel/|v./n.|闻；气味|It smells good.
smile|/smaɪl/|v./n.|微笑|smile at someone
smoke|/sməʊk/|v./n.|吸烟；烟|No smoking.
smooth|/smuːð/|adj.|光滑的|a smooth surface
snake|/sneɪk/|n.|蛇|a dangerous snake
snow|/snəʊ/|n./v.|雪；下雪|It's snowing.
so|/səʊ/|adv./conj.|如此；所以|So do I.
soap|/səʊp/|n.|肥皂|a bar of soap
social|/ˈsəʊʃl/|adj.|社会的|social media
society|/səˈsaɪəti/|n.|社会|modern society
sock|/sɒk/|n.|袜子|a pair of socks
soft|/sɒft/|adj.|柔软的|a soft pillow
soil|/sɔɪl/|n.|土壤|rich soil
soldier|/ˈsəʊldʒə/|n.|士兵|a brave soldier
solid|/ˈsɒlɪd/|adj./n.|固体的；坚实的|a solid foundation
solve|/sɒlv/|v.|解决|solve a problem
some|/sʌm/|adj./pron.|一些|some water
someone|/ˈsʌmwʌn/|pron.|某人|Someone is waiting.
something|/ˈsʌmθɪŋ/|pron.|某事|Something happened.
sometimes|/ˈsʌmtaɪmz/|adv.|有时|Sometimes I walk.
somewhere|/ˈsʌmweə/|adv.|某处|somewhere else
son|/sʌn/|n.|儿子|his son
song|/sɒŋ/|n.|歌曲|a popular song
soon|/suːn/|adv.|不久|See you soon.
sorry|/ˈsɒri/|adj.|抱歉的|I'm sorry.
sort|/sɔːt/|n./v.|种类；分类|sort out
soul|/səʊl/|n.|灵魂|the soul of the nation
sound|/saʊnd/|n./v.|声音；听起来|That sounds good.
soup|/suːp/|n.|汤|a bowl of soup
source|/sɔːs/|n.|来源|a reliable source
south|/saʊθ/|n./adj.|南方|in the south
space|/speɪs/|n.|空间；太空|outer space
spare|/speə/|adj./v.|多余的；抽出|spare time
speak|/spiːk/|v.|说|speak English
special|/ˈspeʃl/|adj.|特别的|a special gift
specific|/spəˈsɪfɪk/|adj.|具体的|specific instructions
speech|/spiːtʃ/|n.|演讲|make a speech
speed|/spiːd/|n.|速度|at high speed
spell|/spel/|v.|拼写|How do you spell it?
spend|/spend/|v.|花费|spend money
spirit|/ˈspɪrɪt/|n.|精神|team spirit
split|/splɪt/|v.|分开|split into groups
spoil|/spɔɪl/|v.|破坏；宠坏|spoil the fun
sponsor|/ˈspɒnsə/|n./v.|赞助商；赞助|a sponsor
sport|/spɔːt/|n.|运动|sports meeting
spot|/spɒt/|n./v.|地点；发现|a scenic spot
spread|/spred/|v./n.|传播；展开|spread out
spring|/sprɪŋ/|n.|春天|in spring
square|/skweə/|n./adj.|正方形；平方|a square meter
staff|/stɑːf/|n.|员工|the teaching staff
stage|/steɪdʒ/|n.|舞台；阶段|on stage
stand|/stænd/|v./n.|站；忍受；摊位|stand up
standard|/ˈstændəd/|n./adj.|标准；标准的|high standard
star|/stɑː/|n.|星；明星|a movie star
stare|/steə/|v.|凝视|stare at
start|/stɑːt/|v./n.|开始|start a business
state|/steɪt/|n./v.|状态；国家；陈述|in good state
station|/ˈsteɪʃn/|n.|车站|a railway station
statue|/ˈstætʃuː/|n.|雕像|a stone statue
stay|/steɪ/|v.|停留|stay at home
steady|/ˈstedi/|adj.|稳定的|a steady job
steal|/stiːl/|v.|偷|steal money
steam|/stiːm/|n.|蒸汽|steam engine
steel|/stiːl/|n.|钢|a steel bridge
steep|/stiːp/|adj.|陡峭的|a steep hill
step|/step/|n./v.|步骤；迈步|take a step
stick|/stɪk/|v./n.|粘；棍|stick to
still|/stɪl/|adv./adj.|仍然；静止的|He is still here.
stimulate|/ˈstɪmjuleɪt/|v.|刺激|stimulate interest
stock|/stɒk/|n.|库存；股票|in stock
stomach|/ˈstʌmək/|n.|胃|a stomach ache
stone|/stəʊn/|n.|石头|a stone bridge
stop|/stɒp/|v./n.|停止|Stop the car.
store|/stɔː/|n./v.|商店；储存|a department store
storm|/stɔːm/|n.|暴风雨|a heavy storm
story|/ˈstɔːri/|n.|故事|a short story
straight|/streɪt/|adj./adv.|直的|go straight
strange|/streɪndʒ/|adj.|奇怪的|a strange feeling
strategy|/ˈstrætədʒi/|n.|策略|a new strategy
stream|/striːm/|n.|溪流|a mountain stream
street|/striːt/|n.|街道|on the street
strength|/streŋθ/|n.|力量|inner strength
stress|/stres/|n./v.|压力；强调|under stress
stretch|/stretʃ/|v.|伸展|stretch your arms
strike|/straɪk/|v./n.|打击；罢工|strike a match
strong|/strɒŋ/|adj.|强壮的|a strong wind
struggle|/ˈstrʌɡl/|v./n.|挣扎；奋斗|struggle for life
student|/ˈstjuːdnt/|n.|学生|a good student
study|/ˈstʌdi/|v./n.|学习；研究|study hard
stuff|/stʌf/|n./v.|东西；塞满|heavy stuff
stupid|/ˈstjuːpɪd/|adj.|愚蠢的|a stupid mistake
style|/staɪl/|n.|风格|a new style
subject|/ˈsʌbdʒɪkt/|n.|科目；主题；主语|my favourite subject
submit|/səbˈmɪt/|v.|提交|submit the form
subscribe|/səbˈskraɪb/|v.|订阅|subscribe to a magazine
succeed|/səkˈsiːd/|v.|成功|succeed in doing
success|/səkˈses/|n.|成功|great success
such|/sʌtʃ/|adj.|这样的|such a good idea
sudden|/ˈsʌdən/|adj.|突然的|a sudden change
suffer|/ˈsʌfə/|v.|遭受|suffer from illness
sufficient|/səˈfɪʃnt/|adj.|充足的|sufficient evidence
suggest|/səˈdʒest/|v.|建议；表明|I suggest going.
suit|/suːt/|v./n.|适合；套装|The colour suits you.
summer|/ˈsʌmə/|n.|夏天|summer vacation
sun|/sʌn/|n.|太阳|under the sun
supply|/səˈplaɪ/|v./n.|供应|supply water
support|/səˈpɔːt/|v./n.|支持|support a family
suppose|/səˈpəʊz/|v.|假设|I suppose so.
sure|/ʃʊə/|adj.|确信的|I'm sure.
surface|/ˈsɜːfɪs/|n.|表面|the surface of the earth
surprise|/səˈpraɪz/|n./v.|惊讶|to my surprise
surround|/səˈraʊnd/|v.|包围|surrounded by mountains
survey|/ˈsɜːveɪ/|n./v.|调查|a recent survey
survive|/səˈvaɪv/|v.|幸存|survive the accident
suspect|/səˈspekt/|v./n.|怀疑；嫌疑人|suspect someone
sustain|/səˈsteɪn/|v.|维持|sustain life
swallow|/ˈswɒləʊ/|v.|吞下|swallow the pill
swear|/sweə/|v.|发誓|swear to tell the truth
sweat|/swet/|n./v.|汗；出汗|sweat heavily
sweep|/swiːp/|v.|扫|sweep the floor
sweet|/swiːt/|adj.|甜的|a sweet smile
swim|/swɪm/|v.|游泳|go swimming
swing|/swɪŋ/|v./n.|摇摆|swing in the wind
switch|/swɪtʃ/|v./n.|切换；开关|switch off the light
symbol|/ˈsɪmbl/|n.|符号；象征|a symbol of peace
sympathy|/ˈsɪmpəθi/|n.|同情|express sympathy
system|/ˈsɪstəm/|n.|系统|the solar system
table|/ˈteɪbl/|n.|桌子；表格|on the table
tackle|/ˈtækl/|v.|处理|tackle a problem
tag|/tæɡ/|n.|标签|a price tag
tail|/teɪl/|n.|尾巴|a dog's tail
take|/teɪk/|v.|拿；花费|take a bus
talent|/ˈtælənt/|n.|天赋|a talented singer
talk|/tɔːk/|v./n.|谈话|talk to me
tall|/tɔːl/|adj.|高的|a tall building
tame|/teɪm/|adj./v.|温顺的；驯服|a tame animal
tap|/tæp/|v./n.|轻拍；龙头|tap the water
target|/ˈtɑːɡɪt/|n.|目标|reach the target
task|/tɑːsk/|n.|任务|a difficult task
taste|/teɪst/|v./n.|尝；味道|It tastes sweet.
teach|/tiːtʃ/|v.|教|teach English
teacher|/ˈtiːtʃə/|n.|老师|a kind teacher
team|/tiːm/|n.|团队|a football team
tear|/tɪə/|n./v.|眼泪；撕|burst into tears
technical|/ˈteknɪkl/|adj.|技术的|technical support
technique|/tekˈniːk/|n.|技巧|a useful technique
technology|/tekˈnɒlədʒi/|n.|技术|modern technology
teenager|/ˈtiːneɪdʒə/|n.|青少年|a teenage boy
telephone|/ˈtelɪfəʊn/|n.|电话|answer the telephone
tell|/tel/|v.|告诉|Tell me the truth.
temperature|/ˈtemprətʃə/|n.|温度|high temperature
temporary|/ˈtemprəri/|adj.|临时的|a temporary job
tend|/tend/|v.|倾向于；照料|tend to do
tendency|/ˈtendənsi/|n.|趋势|a growing tendency
tennis|/ˈtenɪs/|n.|网球|play tennis
tense|/tens/|adj./n.|紧张的；时态|feel tense
term|/tɜːm/|n.|学期；术语|this term
terrible|/ˈterəbl/|adj.|糟糕的|a terrible mistake
territory|/ˈterətri/|n.|领土|a vast territory
test|/test/|n./v.|测试|take a test
text|/tekst/|n.|文本；课文|read the text
thank|/θæŋk/|v.|感谢|Thank you.
theatre|/ˈθɪətə/|n.|剧院|go to the theatre
theme|/θiːm/|n.|主题|the theme of the essay
then|/ðen/|adv.|然后|and then
theory|/ˈθɪəri/|n.|理论|in theory
there|/ðeə/|adv.|那里|over there
therefore|/ˈðeəfɔː/|adv.|因此|Therefore, we must go.
these|/ðiːz/|pron.|这些|these books
they|/ðeɪ/|pron.|他们|They are here.
thing|/θɪŋ/|n.|东西|one thing
think|/θɪŋk/|v.|思考|Think carefully.
third|/θɜːd/|num.|第三|the third day
thirst|/θɜːst/|n.|口渴|die of thirst
though|/ðəʊ/|conj.|虽然|Even though
thought|/θɔːt/|n.|想法|deep in thought
thousand|/ˈθaʊznd/|num.|一千|thousands of
threat|/θret/|n.|威胁|a serious threat
thrill|/θrɪl/|n./v.|激动|a thrill of joy
thrive|/θraɪv/|v.|兴旺|business thrives
throw|/θrəʊ/|v.|扔|throw a ball
thumb|/θʌm/|n.|拇指|thumb up
thunder|/ˈθʌndə/|n.|雷|thunder storm
thus|/ðʌs/|adv.|因此|Thus, the problem was solved.
ticket|/ˈtɪkɪt/|n.|票|a train ticket
tidy|/ˈtaɪdi/|adj./v.|整洁的；整理|tidy the room
tie|/taɪ/|v./n.|系；领带；平局|tie a knot
tight|/taɪt/|adj.|紧的|a tight schedule
till|/tɪl/|prep./conj.|直到|wait till tomorrow
timber|/ˈtɪmbə/|n.|木材|timber trade
time|/taɪm/|n.|时间；次数|on time
tiny|/ˈtaɪni/|adj.|极小的|a tiny baby
tip|/tɪp/|n./v.|尖端；提示；小费|useful tips
tire|/ˈtaɪə/|v.|使疲倦|The work tired me.
tired|/ˈtaɪəd/|adj.|疲倦的|I am tired.
title|/ˈtaɪtl/|n.|标题|the title of the book
toast|/təʊst/|n./v.|吐司；祝酒|a piece of toast
today|/təˈdeɪ/|n./adv.|今天|today's news
together|/təˈɡeðə/|adv.|一起|work together
tomato|/təˈmɑːtəʊ/|n.|西红柿|tomato soup
tomorrow|/təˈmɒrəʊ/|n./adv.|明天|See you tomorrow.
tone|/təʊn/|n.|语气；色调|a friendly tone
tonight|/təˈnaɪt/|n./adv.|今晚|tonight's show
too|/tuː/|adv.|也；太|Me too.
tool|/tuːl/|n.|工具|a useful tool
top|/tɒp/|n./adj.|顶部|at the top of
topic|/ˈtɒpɪk/|n.|话题|a popular topic
total|/ˈtəʊtl/|n./adj.|总数；总计的|in total
touch|/tʌtʃ/|v./n.|触摸|Don't touch it.
tough|/tʌf/|adj.|艰难的|a tough decision
tour|/tʊə/|n./v.|旅行|a guided tour
tourist|/ˈtʊərɪst/|n.|游客|a tourist attraction
toward|/təˈwɔːd/|prep.|朝向|walk toward the house
tower|/ˈtaʊə/|n.|塔|a clock tower
town|/taʊn/|n.|城镇|a small town
toy|/tɔɪ/|n.|玩具|a toy car
trace|/treɪs/|n./v.|痕迹；追踪|trace the origin
trade|/treɪd/|n./v.|贸易|international trade
tradition|/trəˈdɪʃn/|n.|传统|keep a tradition
traditional|/trəˈdɪʃənl/|adj.|传统的|traditional food
traffic|/ˈtræfɪk/|n.|交通|heavy traffic
train|/treɪn/|n./v.|火车；训练|by train
transfer|/trænsˈfɜː/|v.|转移；换乘|transfer to another school
transform|/trænsˈfɔːm/|v.|改变|transform the city
translate|/trænzˈleɪt/|v.|翻译|translate into Chinese
transport|/ˈtrænspɔːt/|n./v.|运输|public transport
trap|/træp/|n./v.|陷阱|fall into a trap
travel|/ˈtrævl/|v./n.|旅行|travel around the world
treat|/triːt/|v.|对待；治疗|treat patients
treatment|/ˈtriːtmənt/|n.|治疗；对待|medical treatment
tree|/triː/|n.|树|plant a tree
trend|/trend/|n.|趋势|a new trend
trial|/ˈtraɪəl/|n.|审判；试验|a clinical trial
tribe|/traɪb/|n.|部落|an ancient tribe
trick|/trɪk/|n./v.|诡计；欺骗|play a trick on
trip|/trɪp/|n.|旅行|a day trip
triumph|/ˈtraɪʌmf/|n./v.|胜利|a great triumph
trouble|/ˈtrʌbl/|n./v.|麻烦|in trouble
true|/truː/|adj.|真的|a true story
trust|/trʌst/|v./n.|信任|trust a friend
truth|/truːθ/|n.|真相|tell the truth
try|/traɪ/|v.|尝试|try again
tube|/tjuːb/|n.|管子|a test tube
tune|/tjuːn/|n./v.|曲调；调音|in tune
turn|/tɜːn/|v./n.|转动；轮流|turn left
twin|/twɪn/|n./adj.|双胞胎|twin brothers
twist|/twɪst/|v./n.|扭曲|twist the rope
type|/taɪp/|n./v.|类型；打字|different types
typical|/ˈtɪpɪkl/|adj.|典型的|a typical example
ugly|/ˈʌɡli/|adj.|丑的|an ugly duckling
ultimate|/ˈʌltɪmət/|adj.|最终的|the ultimate goal
umbrella|/ʌmˈbrelə/|n.|雨伞|take an umbrella
unable|/ʌnˈeɪbl/|adj.|无法的；不能的|be unable to do
uncle|/ˈʌŋkl/|n.|叔叔|my uncle
under|/ˈʌndə/|prep.|在……下面|under the table
understand|/ˌʌndəˈstænd/|v.|理解|I understand.
undertake|/ˌʌndəˈteɪk/|v.|承担|undertake a task
unemployment|/ˌʌnɪmˈplɔɪmənt/|n.|失业|high unemployment
unfair|/ʌnˈfeə/|adj.|不公平的|an unfair decision
unfortunate|/ʌnˈfɔːtʃənət/|adj.|不幸的|an unfortunate accident
uniform|/ˈjuːnɪfɔːm/|n./adj.|制服；统一的|a school uniform
union|/ˈjuːniən/|n.|联盟；工会|a trade union
unique|/juˈniːk/|adj.|独特的|a unique style
unit|/ˈjuːnɪt/|n.|单位；单元|a unit of measurement
unite|/juˈnaɪt/|v.|联合|unite together
universal|/ˌjuːnɪˈvɜːsl/|adj.|普遍的|a universal truth
universe|/ˈjuːnɪvɜːs/|n.|宇宙|the whole universe
university|/ˌjuːnɪˈvɜːsəti/|n.|大学|at university
unknown|/ʌnˈnəʊn/|adj.|未知的|an unknown fact
unlike|/ʌnˈlaɪk/|prep./adj.|不像|unlike others
unusual|/ʌnˈjuːʒuəl/|adj.|不寻常的|an unusual event
up|/ʌp/|adv./prep.|向上|stand up
update|/ʌpˈdeɪt/|v./n.|更新|update the software
upon|/əˈpɒn/|prep.|在……之上|once upon a time
upper|/ˈʌpə/|adj.|上面的|the upper floor
upset|/ʌpˈset/|adj./v.|心烦的；推翻|be upset about
urban|/ˈɜːbən/|adj.|城市的|urban areas
urge|/ɜːdʒ/|v./n.|敦促；冲动|urge someone to do
urgent|/ˈɜːdʒənt/|adj.|紧急的|an urgent matter
use|/juːz/|v./n.|使用|use a computer
useful|/ˈjuːsfl/|adj.|有用的|a useful tip
usual|/ˈjuːʒuəl/|adj.|通常的|as usual
usually|/ˈjuːʒuəli/|adv.|通常|I usually walk.
utility|/juːˈtɪləti/|n.|公用事业|public utilities
vacant|/ˈveɪkənt/|adj.|空的|a vacant room
vacation|/vəˈkeɪʃn/|n.|假期|on vacation
vague|/veɪɡ/|adj.|模糊的|a vague idea
valid|/ˈvælɪd/|adj.|有效的|a valid ticket
valley|/ˈvæli/|n.|山谷|a deep valley
valuable|/ˈvæljəbl/|adj.|有价值的|valuable advice
value|/ˈvæljuː/|n./v.|价值；重视|family values
vanish|/ˈvænɪʃ/|v.|消失|The fog vanished.
variety|/vəˈraɪəti/|n.|多样|a variety of
various|/ˈveəriəs/|adj.|各种各样的|various reasons
vary|/ˈveəri/|v.|变化|Prices vary.
vast|/vɑːst/|adj.|巨大的|a vast area
vegetable|/ˈvedʒtəbl/|n.|蔬菜|fresh vegetables
vehicle|/ˈviːəkl/|n.|车辆|motor vehicles
venture|/ˈventʃə/|n./v.|冒险；企业|a business venture
verb|/vɜːb/|n.|动词|an action verb
verify|/ˈverɪfaɪ/|v.|核实|verify the facts
version|/ˈvɜːʃn/|n.|版本|a new version
vessel|/ˈvesl/|n.|船；容器|a fishing vessel
victim|/ˈvɪktɪm/|n.|受害者|the victim of the crime
victory|/ˈvɪktəri/|n.|胜利|a great victory
video|/ˈvɪdiəʊ/|n.|视频|watch a video
view|/vjuː/|n./v.|观点；景色；看待|in my view
village|/ˈvɪlɪdʒ/|n.|村庄|a small village
violence|/ˈvaɪələns/|n.|暴力|act of violence
violent|/ˈvaɪələnt/|adj.|暴力的|a violent storm
virtue|/ˈvɜːtʃuː/|n.|美德|the virtue of patience
virus|/ˈvaɪrəs/|n.|病毒|a computer virus
visible|/ˈvɪzəbl/|adj.|可见的|clearly visible
vision|/ˈvɪʒn/|n.|视力；远见|good vision
visit|/ˈvɪzɪt/|v./n.|参观|visit a museum
vital|/ˈvaɪtl/|adj.|至关重要的|vital importance
voice|/vɔɪs/|n.|声音|in a low voice
volcano|/vɒlˈkeɪnəʊ/|n.|火山|an active volcano
volunteer|/ˌvɒlənˈtɪə/|n./v.|志愿者|a volunteer teacher
vote|/vəʊt/|n./v.|投票|cast a vote
voyage|/ˈvɔɪɪdʒ/|n.|航行|a long voyage
wage|/weɪdʒ/|n.|工资|a weekly wage
wait|/weɪt/|v./n.|等待|wait for a bus
wake|/weɪk/|v.|醒来|wake up early
walk|/wɔːk/|v./n.|走|walk to school
wall|/wɔːl/|n.|墙|on the wall
wander|/ˈwɒndə/|v.|漫游|wander in the street
want|/wɒnt/|v.|想要|I want a book.
war|/wɔː/|n.|战争|the World War
warm|/wɔːm/|adj.|温暖的|a warm day
warn|/wɔːn/|v.|警告|warn him of the danger
wash|/wɒʃ/|v.|洗|wash hands
waste|/weɪst/|v./n.|浪费|waste time
watch|/wɒtʃ/|v./n.|观看；手表|watch TV
water|/ˈwɔːtə/|n.|水|drink water
wave|/weɪv/|n./v.|波浪；挥手|wave goodbye
weak|/wiːk/|adj.|虚弱的|a weak point
wealth|/welθ/|n.|财富|great wealth
weapon|/ˈwepən/|n.|武器|a dangerous weapon
wear|/weə/|v.|穿|wear a coat
weather|/ˈweðə/|n.|天气|fine weather
weigh|/weɪ/|v.|称重|weigh the box
weight|/weɪt/|n.|重量|lose weight
welcome|/ˈwelkəm/|v./adj.|欢迎|You're welcome.
welfare|/ˈwelfeə/|n.|福利|social welfare
well|/wel/|adv./adj.|好；健康的|do well
west|/west/|n./adj.|西方|in the west
wet|/wet/|adj.|湿的|wet clothes
whatever|/wɒtˈevə/|pron.|无论什么|Whatever happens...
wheel|/wiːl/|n.|轮子|a car wheel
when|/wen/|conj.|当……时|when I was young
whenever|/wenˈevə/|conj.|无论何时|Call me whenever.
where|/weə/|adv.|哪里|Where is it?
whether|/ˈweðə/|conj.|是否|whether or not
which|/wɪtʃ/|pron.|哪一个|Which do you want?
while|/waɪl/|conj.|当……时；然而|while reading
whisper|/ˈwɪspə/|v./n.|低语|whisper in the ear
white|/waɪt/|adj./n.|白色的|a white shirt
who|/huː/|pron.|谁|Who are you?
whole|/həʊl/|adj.|整个的|the whole day
whom|/huːm/|pron.|谁(宾格)|To whom it may concern
whose|/huːz/|pron.|谁的|Whose book is this?
why|/waɪ/|adv.|为什么|Why not?
wide|/waɪd/|adj.|宽的|a wide road
widespread|/ˈwaɪdspred/|adj.|广泛的|widespread damage
wife|/waɪf/|n.|妻子|his wife
wild|/waɪld/|adj.|野生的|wild animals
will|/wɪl/|v./n.|将；意志|I will go.
win|/wɪn/|v.|赢|win the game
wind|/wɪnd/|n.|风|a strong wind
window|/ˈwɪndəʊ/|n.|窗户|open the window
wine|/waɪn/|n.|酒|red wine
wing|/wɪŋ/|n.|翅膀|bird's wings
winner|/ˈwɪnə/|n.|获胜者|the winner of the race
winter|/ˈwɪntə/|n.|冬天|in winter
wisdom|/ˈwɪzdəm/|n.|智慧|words of wisdom
wise|/waɪz/|adj.|明智的|a wise decision
wish|/wɪʃ/|v./n.|希望；愿望|make a wish
with|/wɪð/|prep.|和；用|with a pen
withdraw|/wɪðˈdrɔː/|v.|撤回|withdraw money
within|/wɪˈðɪn/|prep.|在……之内|within reach
without|/wɪˈðaʊt/|prep.|没有|without doubt
witness|/ˈwɪtnəs/|n./v.|目击者；见证|a witness to the accident
woman|/ˈwʊmən/|n.|妇女|a young woman
wonder|/ˈwʌndə/|v./n.|想知道；奇迹|I wonder why.
wonderful|/ˈwʌndəfl/|adj.|精彩的|a wonderful time
wood|/wʊd/|n.|木头|a piece of wood
wool|/wʊl/|n.|羊毛|a wool sweater
word|/wɜːd/|n.|词|in other words
work|/wɜːk/|v./n.|工作|work hard
worker|/ˈwɜːkə/|n.|工人|a factory worker
world|/wɜːld/|n.|世界|around the world
worry|/ˈwʌri/|v./n.|担心|Don't worry.
worse|/wɜːs/|adj./adv.|更糟的|get worse
worst|/wɜːst/|adj./adv.|最糟的|the worst day
worth|/wɜːθ/|adj.|值得的|be worth doing
would|/wʊd/|v.|将会|Would you like some tea?
wound|/wuːnd/|n./v.|伤口；受伤|a deep wound
wrap|/ræp/|v.|包裹|wrap a gift
wreck|/rek/|n./v.|残骸；破坏|a ship wreck
write|/raɪt/|v.|写|write a letter
writer|/ˈraɪtə/|n.|作家|a famous writer
wrong|/rɒŋ/|adj.|错误的|You are wrong.
yard|/jɑːd/|n.|院子|a back yard
year|/jɪə/|n.|年|this year
yellow|/ˈjeləʊ/|adj./n.|黄色的|yellow leaves
yes|/jes/|adv.|是的|Yes, please.
yesterday|/ˈjestədeɪ/|n./adv.|昨天|yesterday morning
yet|/jet/|adv.|还；仍然|not yet
yield|/jiːld/|v./n.|生产；屈服|yield to pressure
young|/jʌŋ/|adj.|年轻的|a young man
youth|/juːθ/|n.|青春；年轻人|youth culture
zero|/ˈzɪərəʊ/|num.|零|zero degrees
zone|/zəʊn/|n.|区域|a danger zone`;

function parse(raw) {
  return raw.split('\n').map((line) => line.trim()).filter(Boolean).map((line) => {
    const [term, phonetic, pos, meaning, example = ''] = line.split('|');
    return { term, phonetic, pos, meaning, example };
  });
}

export const GAOKAO_WORDS = parse(RAW);

const INDEX = new Map(GAOKAO_WORDS.map((w) => [w.term.toLowerCase(), w]));

/** 内置词库精确查询 */
export function builtinLookup(term) {
  const key = String(term || '').trim().toLowerCase();
  return INDEX.get(key) || null;
}

/** 内置词库模糊搜索（前缀/包含），最多 limit 条 */
export function builtinSearch(keyword, limit = 20) {
  const kw = String(keyword || '').trim().toLowerCase();
  if (!kw) return [];
  const exact = [], prefix = [], contains = [];
  for (const w of GAOKAO_WORDS) {
    const t = w.term.toLowerCase();
    if (t === kw) exact.push(w);
    else if (t.startsWith(kw)) prefix.push(w);
    else if (t.includes(kw) || w.meaning.includes(keyword)) contains.push(w);
  }
  return [...exact, ...prefix, ...contains].slice(0, limit);
}
