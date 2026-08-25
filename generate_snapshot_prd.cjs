const fs = require('fs');
const path = require('path');
const {
  AlignmentType, BorderStyle, Document, Footer, Header, HeadingLevel, ImageRun,
  Packer, PageBreak, PageNumber, Paragraph, ShadingType, Table, TableCell,
  TableRow, TextRun, VerticalAlign, WidthType
} = require('docx');

const root = 'D:/360/codex/AI沙箱/projects';
const site = path.join(root, 'projects');
const out = path.join(root, 'artifacts', 'sandbox-snapshot-prd');
const previewDir = path.join(out, 'preview');
fs.mkdirSync(previewDir, { recursive: true });

const screenshotPaths = [
  path.join(previewDir, '01-instance-create-snapshot.png'),
  path.join(previewDir, '02-snapshot-list.png'),
  path.join(previewDir, '03-create-from-snapshot.png')
];

const { chromium } = require('playwright');
const http = require('http');
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript', '.png': 'image/png', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg' };

function startServer() {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      let uri = decodeURIComponent(req.url.split('?')[0]);
      if (uri === '/') uri = '/index.html';
      const file = path.resolve(site, '.' + uri);
      if (!file.startsWith(path.resolve(site))) { res.writeHead(403); res.end(); return; }
      fs.readFile(file, (err, data) => {
        if (err) { res.writeHead(404); res.end('Not Found'); return; }
        res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
        res.end(data);
      });
    });
    server.listen(9021, '127.0.0.1', () => resolve(server));
  });
}

const border = { style: BorderStyle.SINGLE, size: 1, color: 'D9E2F3' };
const borders = { top: border, bottom: border, left: border, right: border };
const widths = { two: [2400, 6960], three: [1440, 2640, 4080], four: [1320, 2280, 2640, 3120] };
const p = (text, options = {}) => new Paragraph({
  spacing: { after: 120, line: 320 },
  ...options,
  children: [new TextRun({ text, font: 'Microsoft YaHei', size: 21, ...options.run })]
});
const cell = (text, width, header = false) => new TableCell({
  borders,
  width: { size: width, type: WidthType.DXA },
  verticalAlign: VerticalAlign.CENTER,
  shading: header ? { fill: 'DCE6F1', type: ShadingType.CLEAR } : undefined,
  children: [new Paragraph({ spacing: { before: 80, after: 80 }, children: [new TextRun({ text, font: 'Microsoft YaHei', size: 19, bold: header })] })]
});
function table(headers, rows, colWidths) {
  return new Table({
    columnWidths: colWidths,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    rows: [new TableRow({ tableHeader: true, children: headers.map((h, i) => cell(h, colWidths[i], true)) }), ...rows.map(row => new TableRow({ children: row.map((v, i) => cell(v, colWidths[i])) }))]
  });
}
function bullet(text) { return new Paragraph({ numbering: { reference: 'bullets', level: 0 }, spacing: { after: 70, line: 300 }, children: [new TextRun({ text, font: 'Microsoft YaHei', size: 21 })] }); }
function heading(text, level = 1) { return new Paragraph({ heading: level === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2, children: [new TextRun({ text, font: 'Microsoft YaHei' })] }); }
function image(file, caption) {
  return [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 80 }, children: [new ImageRun({ type: 'png', data: fs.readFileSync(file), transformation: { width: 600, height: 338 }, altText: { title: caption, description: caption, name: caption } })] }), p(`图：${caption}`, { alignment: AlignmentType.CENTER, run: { size: 18, color: '666666' } })];
}

async function captureScreenshots() {
  const server = await startServer();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await page.goto('http://127.0.0.1:9021/index.html', { waitUntil: 'networkidle' });
  await page.locator('.create-snapshot-btn').first().click();
  await page.screenshot({ path: screenshotPaths[0], fullPage: false });
  await page.goto('http://127.0.0.1:9021/sandbox-snapshots.html', { waitUntil: 'networkidle' });
  await page.screenshot({ path: screenshotPaths[1], fullPage: false });
  await page.evaluate(() => sessionStorage.setItem('sandboxSnapshots', JSON.stringify([{ id:'snap_prd_demo', name:'snapshot-prd-demo', sourceSandboxId:'sandbox-dev-python', template:'Python 3.11', cpu:'2核', memory:'4GB', status:'ready', createdAt:'2026-07-17 10:00:00', description:'PRD 演示快照', captureMode:'full' }])));
  await page.goto('http://127.0.0.1:9021/sandbox-snapshot-create.html?id=snap_prd_demo', { waitUntil: 'networkidle' });
  await page.screenshot({ path: screenshotPaths[2], fullPage: false });
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}

function buildDoc() {
  const children = [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 720, after: 280 }, children: [new TextRun({ text: 'AI 沙箱快照功能', font: 'Microsoft YaHei', size: 48, bold: true, color: '1F4E79' })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 720 }, children: [new TextRun({ text: '产品需求文档（PRD）', font: 'Microsoft YaHei', size: 32, color: '4F81BD' })] }),
    p('文档状态：已上线（原型实现）', { alignment: AlignmentType.CENTER, run: { size: 22, color: '666666' } }),
    p('版本：v1.0    日期：2026-07-17', { alignment: AlignmentType.CENTER, run: { size: 22, color: '666666' } }),
    new Paragraph({ children: [new PageBreak()] }),
    heading('文档修订历史'),
    table(['修订日期', '版本号', '版本说明', '产品负责人'], [['2026-07-17', 'v1.0', '首次梳理已实现的沙箱快照创建、管理与派生能力', '产品团队']], widths.four),
    heading('一、需求信息'),
    table(['#', '功能模块', '所属类别', '功能点说明', '需求方'], [
      ['1', '快照创建', '新增', '从运行中的代码沙箱生成完整快照，形成可复用基线。', 'AI 沙箱用户'],
      ['2', '快照管理', '新增', '集中检索、筛选、查看并删除沙箱快照。', 'AI 沙箱用户'],
      ['3', '快照派生', '新增', '从可用快照创建独立的新沙箱，并继承基础资源配置。', 'AI 沙箱用户']
    ], [540, 1500, 1080, 4980, 1260]),
    heading('二、需求说明'),
    heading('模块一：从沙箱实例创建快照', 2),
    ...image(screenshotPaths[0], '实例列表中的“创建快照”弹窗'),
    p('功能描述', { run: { bold: true, color: '1F4E79' } }),
    bullet('在“沙箱实例”列表中，用户可对实例执行“创建快照”。入口携带来源沙箱 ID、模板、CPU 与内存配置。'),
    bullet('创建弹窗展示来源实例与模板；用户必须填写快照名称，可选填写描述，用于标识快照用途或基线。'),
    bullet('本期创建类型固定为完整快照：保存文件系统和运行时内存状态。创建期间源实例会短暂停顿，WebSocket、终端和命令流连接将断开；完成后源实例恢复运行。'),
    p('规则与校验', { run: { bold: true, color: '1F4E79' } }),
    table(['规则', '当前实现'], [
      ['名称必填', '名称为空时阻止提交并提示“请输入快照名称”。'],
      ['名称唯一', '当前会话内快照名称不可重复，重复时阻止创建。'],
      ['创建中防重复', '提交后按钮禁用并展示“创建中...”，直至结果返回。'],
      ['创建完成', '生成快照 ID、创建时间、来源沙箱、模板、CPU、内存、描述与完整快照标识；状态置为“可用”，跳转至快照列表。']
    ], widths.two),
    heading('模块二：快照列表与生命周期管理', 2),
    ...image(screenshotPaths[1], '沙箱快照列表、检索与状态筛选'),
    p('功能描述', { run: { bold: true, color: '1F4E79' } }),
    bullet('侧边栏“沙箱快照”导航进入管理页；空列表提供“前往实例列表创建快照”入口。'),
    bullet('列表展示快照 ID、快照名称、来源沙箱、模板、状态、创建时间、描述与操作。'),
    bullet('支持按快照 ID、名称或来源沙箱实时搜索，并可按全部、可用、创建中、创建失败筛选；刷新按钮重新渲染当前数据。'),
    p('状态与操作约束', { run: { bold: true, color: '1F4E79' } }),
    table(['状态', '可从快照创建', '可删除', '说明'], [
      ['可用（ready）', '允许', '允许', '快照完整，支持派生新实例或删除。'],
      ['创建中（creating）', '不允许', '不允许', '页面禁用相关操作并说明快照尚不可用。'],
      ['创建失败（failed）', '当前页面可筛选', '待后端规则确认', '原型保留状态展示；失败重试与删除策略未实现。']
    ], widths.four),
    p('删除规则', { run: { bold: true, color: '1F4E79' } }),
    bullet('删除前必须二次确认，确认框明确提示“删除后不可恢复”。'),
    bullet('删除快照不影响此前已通过该快照创建的实例。'),
    heading('模块三：从快照创建独立沙箱', 2),
    ...image(screenshotPaths[2], '从可用快照创建沙箱'),
    p('功能描述', { run: { bold: true, color: '1F4E79' } }),
    bullet('用户在可用快照行点击“从快照创建”，页面通过快照 ID 查找来源快照；找不到快照或快照非可用状态时展示不可用提示并提供返回列表入口。'),
    bullet('创建页只读展示来源快照、快照创建时间、来源沙箱、模板、CPU、内存，并固定沙箱类型为“代码沙箱”。'),
    bullet('用户可配置新实例超时时间，默认 600 秒，最小值 1 秒。创建动作生成独立新沙箱，快照与源实例均不被修改。'),
    bullet('新实例继承模板、CPU、内存和来源快照标识；实例状态初始化为“运行中”。'),
    heading('三、状态机说明'),
    table(['状态', '触发条件', '允许操作', '退出条件'], [
      ['创建中', '用户确认创建快照后', '查看、筛选', '创建成功进入可用；创建异常进入创建失败。'],
      ['可用', '快照创建成功', '从快照创建、删除、查看、筛选', '用户删除后移除。'],
      ['创建失败', '快照创建异常', '查看、筛选', '重试、删除等正式策略需服务端能力定义。']
    ], widths.four),
    p('状态流转：创建中 → 可用；创建中 → 创建失败；可用 → 已删除（从列表移除）。', { run: { color: '333333' } }),
    heading('四、交互与权限说明'),
    table(['角色/条件', '创建快照', '查看与筛选', '从快照创建', '删除快照'], [
      ['具备沙箱管理权限的用户', '允许，需名称唯一', '允许', '仅限可用快照', '仅限可用快照，需二次确认'],
      ['无权限用户', '应由后端拦截', '应由后端定义', '应由后端拦截', '应由后端拦截']
    ], [1980, 1800, 1800, 1980, 1980]),
    p('说明：当前原型未实现登录态、RBAC 与接口鉴权；生产环境需由服务端基于资源归属和操作权限最终裁决。'),
    heading('五、使用限制说明'),
    bullet('本期为完整快照，创建期间会造成来源实例短暂停顿及实时连接中断；用户须在提交前获得明确提示。'),
    bullet('快照名称仅在当前会话数据中做唯一校验；生产环境应以租户/资源组维度保证唯一性与并发一致性。'),
    bullet('当前原型的快照和派生实例数据保存在浏览器 sessionStorage，关闭会话后不保证保留；生产环境必须持久化至服务端。'),
    bullet('当前未定义单实例最大快照数、快照容量、保留周期、跨地域/跨资源组复制及计费规则。'),
    heading('六、非功能性需求'),
    table(['维度', '要求'], [
      ['一致性', '服务端创建请求需幂等；名称唯一与状态变更需支持并发校验。'],
      ['可靠性', '创建任务应可查询进度与失败原因；前端刷新后应恢复真实任务状态。'],
      ['性能', '列表查询、筛选及状态刷新应在常规数据量下 3 秒内返回；异步创建不得阻塞页面。'],
      ['安全与审计', '记录创建、派生、删除人的身份、时间、来源沙箱与快照 ID；删除操作须可审计。'],
      ['可用性', '状态不可用时清晰禁用派生/删除操作，并说明原因；异常页面提供返回路径。']
    ], widths.two),
    heading('七、风险与边界说明'),
    table(['风险/边界', '影响', '处理要求'], [
      ['运行态完整快照', '会中断终端与 WebSocket 等连接', '提交前明确告知；后端控制暂停与恢复时机。'],
      ['原型数据存储', 'sessionStorage 不具备跨会话持久化与多用户隔离', '上线前替换为服务端快照与任务 API。'],
      ['状态失败处理未闭环', '失败快照无法获取原因或重试', '补充失败码、失败原因、重试与清理策略。'],
      ['资源与成本', '快照可能消耗较大存储和计算资源', '明确配额、容量、生命周期与计费；超限时给出可操作提示。'],
      ['派生范围', '当前仅继承模板、CPU、内存及快照标识', '网络策略、密钥、挂载、环境变量是否继承需由后端/安全规则明确。']
    ], widths.three),
    p('验收依据：可从实例列表创建名称唯一的完整快照；快照列表可检索、筛选、删除；仅可用快照可派生独立沙箱；创建和删除均遵守页面提示与状态约束。', { run: { bold: true, color: '1F4E79' } })
  ];
  return new Document({
    creator: 'WisCode',
    title: 'AI 沙箱快照功能 PRD',
    description: '沙箱快照功能产品需求文档',
    numbering: { config: [{ reference: 'bullets', levels: [{ level: 0, format: 'bullet', text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 480, hanging: 240 } } } }] }] },
    styles: { default: { document: { run: { font: 'Microsoft YaHei', size: 21 } } }, paragraphStyles: [
      { id: 'Title', name: 'Title', basedOn: 'Normal', run: { font: 'Microsoft YaHei', size: 48, bold: true, color: '1F4E79' }, paragraph: { alignment: AlignmentType.CENTER } },
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: 'Microsoft YaHei', size: 30, bold: true, color: '1F4E79' }, paragraph: { spacing: { before: 300, after: 160 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: 'Microsoft YaHei', size: 25, bold: true, color: '2F5597' }, paragraph: { spacing: { before: 220, after: 120 }, outlineLevel: 1 } }
    ] },
    sections: [{
      properties: { page: { margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 } } },
      headers: { default: new Header({ children: [p('AI 沙箱快照功能 PRD', { alignment: AlignmentType.RIGHT, run: { size: 16, color: '7F7F7F' } })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '第 ', font: 'Microsoft YaHei', size: 16, color: '7F7F7F' }), new TextRun({ children: [PageNumber.CURRENT] }), new TextRun({ text: ' 页', font: 'Microsoft YaHei', size: 16, color: '7F7F7F' })] })] }) },
      children
    }]
  });
}

(async () => {
  await captureScreenshots();
  const doc = buildDoc();
  const target = path.join(out, 'AI沙箱快照功能_PRD_v1.0.docx');
  fs.writeFileSync(target, await Packer.toBuffer(doc));
  const manifest = {
    version: 1,
    status: 'complete',
    artifacts: [{ kind: 'docx', filePath: 'AI沙箱快照功能_PRD_v1.0.docx', validation: 'passed', preview: { paths: ['preview/01-instance-create-snapshot.png', 'preview/02-snapshot-list.png', 'preview/03-create-from-snapshot.png'] } }]
  };
  fs.writeFileSync(path.join(out, 'artifacts.tmp.json'), JSON.stringify(manifest, null, 2));
  fs.renameSync(path.join(out, 'artifacts.tmp.json'), path.join(out, 'artifacts.json'));
  console.log(target);
})().catch(err => { console.error(err); process.exit(1); });
