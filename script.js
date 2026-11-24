const topics = {
  film: { title: '레고 테크닉', kicker: 'WHERE IT ALL STARTED', text: '레고 테크닉 자동차를 조립하다 빠른 차에 관심이 생겼어요. 작은 부품을 하나씩 맞추다 보니 관심사까지 조립됐습니다.', symbol: '◉' },
  writing: { title: 'F1', kicker: 'LIGHTS OUT AND AWAY WE GO', text: '빠른 자동차에 빠져 F1을 챙겨 보기 시작했어요. 보다 보니 직접 달려보고 싶어졌고, 그다음 코너는 심레이싱이었습니다.', symbol: '⚑' },
  music: { title: '심레이싱', kicker: 'MY VIRTUAL COCKPIT', text: 'F1을 보다가 직접 달리고 싶어 심레이싱 장비까지 샀어요. 열심히 달리는 중입니다. 현실의 운전 실력과는 별개일지도요.', symbol: '◉' },
  walk: { title: '수학', kicker: 'ONE MORE PROBLEM', text: '수학 문제를 풀고 이론을 공부하는 게 재미있어요. 좋아하는 수학을 따라가다 보니 자연스럽게 AI 공부에도 관심이 생겼습니다.', symbol: '⌁' },
  camera: { title: 'AI', kicker: 'CURIOUS ABOUT WHAT IS NEXT', text: '요즘 가장 관심 있는 건 AI의 발전 속도예요. 놀라움과 기대가 크지만, 앞으로의 공부와 취업은 어떻게 달라질지 걱정도 됩니다.', symbol: '▧' },
  making: { title: '롤과 사람들', kicker: 'BETTER TOGETHER', text: '여자친구와 친구들과 함께 롤을 하기도 해요. 좋아하는 사람들과 웃고 떠드는 시간이 제 일상에 꼭 필요합니다.', symbol: '✳' },
  coffee: { title: '유튜브', kicker: 'JUST ONE MORE VIDEO', text: '유튜브 보는 걸 좋아해요. 흥미로운 영상을 하나 보다 보면 어느새 다음 영상이 기다리고 있습니다.', symbol: '⌂' },
  reading: { title: '디지털헬스케어', kicker: 'MY FIELD OF STUDY', text: '서울대학교 첨단융합학부에서 디지털헬스케어를 전공하고 있어요. 수학과 AI에 대한 관심을 품고 배움을 이어가는 중입니다.', symbol: '▤' },
  collect: { title: '좋아하는 시간', kicker: 'OFF THE SCREEN', text: '배드민턴과 수영을 좋아하고, 고기도 좋아해요. 옛날 발라드를 부르는 것도 좋아합니다. 노래 실력은… 마음만큼은 진심이에요.', symbol: '◇' }
};

// 이 인접 목록이 사이트 속 관심사 그래프를 이룹니다.
const graph = {
  film: ['writing', 'walk'],
  writing: ['film', 'music', 'making'],
  music: ['writing', 'coffee'],
  walk: ['film', 'camera'],
  camera: ['walk', 'making', 'reading'],
  making: ['writing', 'camera', 'collect'],
  coffee: ['music', 'making'],
  reading: ['camera', 'collect'],
  collect: ['making', 'reading']
};

const nodes = [...document.querySelectorAll('.node')];
const content = document.querySelector('#card-content');
const pathList = document.querySelector('#path-list');
const count = document.querySelector('#visit-count');
const nextButton = document.querySelector('#next-button');
const resetButton = document.querySelector('#reset-button');
const paths = [...document.querySelectorAll('.connections path')];
const detail = document.querySelector('#explore-detail');
const mapSection = document.querySelector('#map');
let distances = {};
let startNode = null;
let queue = [];
let cursor = 0;
let visited = [];
let activePath = [];
let parents = {};

function startAt(id) {
  const seen = new Set([id]);
  const bfsQueue = [id];
  const order = [];
  parents = { [id]: null };
  distances = { [id]: 0 };
  startNode = id;
  while (bfsQueue.length) {
    const current = bfsQueue.shift();
    order.push(current);
    for (const neighbor of graph[current]) {
      if (!seen.has(neighbor)) {
        seen.add(neighbor);
        parents[neighbor] = current;
        distances[neighbor] = distances[current] + 1;
        bfsQueue.push(neighbor);
      }
    }
  }
  queue = order;
  cursor = 0;
  visited = [];
  activePath = [];
  nodes.forEach(node => node.classList.toggle('selected', node.dataset.node === id));
  nodes.forEach(node => node.classList.remove('visited'));
  paths.forEach(path => path.classList.remove('active'));
  nextButton.disabled = false;
  showNext();
}

function showNext() {
  if (cursor >= queue.length) {
    nextButton.disabled = true;
    nextButton.innerHTML = '모든 샛길을 둘러봤어요';
    return;
  }
  const id = queue[cursor++];
  visited.push(id);
  const topic = topics[id];
  nodes.forEach(node => {
    node.classList.toggle('selected', node.dataset.node === id);
    if (visited.includes(node.dataset.node)) node.classList.add('visited');
  });
  const symbol = content.querySelector('.card-symbol');
  symbol.textContent = topic.symbol;
  content.querySelector('.card-kicker').textContent = topic.kicker;
  content.querySelector('h3').textContent = topic.title;
  content.querySelector('.card-description').textContent = topic.text;
  count.textContent = `${visited.length}/${Object.keys(topics).length}`;
  const route = [];
  for (let at = id; at !== null; at = parents[at]) route.unshift(topics[at].title);
  detail.textContent = id === startNode
    ? `출발점 · ${topics[id].title}에서 탐색을 시작해요.`
    : `출발점에서 ${distances[id]}단계 · ${route.join(' → ')}`;
  pathList.innerHTML = visited.map(key => `<span class="path-chip">${topics[key].title}</span>`).join('');
  if (parents[id]) {
    const previous = parents[id];
    const orderedNodes = ['film', 'writing', 'music', 'walk', 'camera', 'making', 'coffee', 'reading', 'collect'];
    const a = orderedNodes.indexOf(previous), b = orderedNodes.indexOf(id);
    // SVG 경로는 아래 pathEdges의 같은 순서로 연결되어 있어요.
    const edge = pathEdges.findIndex(([x, y]) => (x === a && y === b) || (x === b && y === a));
    if (edge >= 0) paths[edge].classList.add('active');
    activePath.push([previous, id]);
  }
  if (cursor >= queue.length) {
    nextButton.disabled = true;
    nextButton.textContent = '모든 샛길을 둘러봤어요';
  } else {
    nextButton.textContent = '다음 샛길 찾기';
  }
}

const pathEdges = [[0,1],[1,2],[1,5],[4,5],[5,6],[5,8],[4,7],[7,8],[2,6],[0,3],[3,4]];
nodes.forEach(node => node.addEventListener('click', () => startAt(node.dataset.node)));
document.querySelectorAll('[data-start]').forEach(button => button.addEventListener('click', () => {
  startAt(button.dataset.start);
  mapSection.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}));
nextButton.addEventListener('click', showNext);
resetButton.addEventListener('click', () => {
  queue = []; cursor = 0; visited = []; activePath = []; parents = {}; distances = {}; startNode = null;
  nodes.forEach(node => node.classList.remove('selected', 'visited'));
  paths.forEach(path => path.classList.remove('active'));
  count.textContent = '0/9';
  pathList.textContent = '아직 출발 전이에요';
  detail.textContent = '출발점을 선택하면 거리와 연결을 보여줘요.';
  content.innerHTML = '<div class="card-symbol">?</div><p class="card-kicker">어디서 시작할까요?</p><h3>마음 가는 원을<br>하나 골라주세요.</h3><p class="card-description">가까운 관심사부터 연결을 따라가며 이 작은 지도를 탐험할 수 있어요.</p>';
  nextButton.disabled = true;
  nextButton.textContent = '다음 샛길 찾기';
});
