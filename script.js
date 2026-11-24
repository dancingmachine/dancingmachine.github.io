const topics = {
  film: { title: '오래된 영화', kicker: 'SCENES I KEEP', text: '엔딩 크레딧이 올라간 뒤에도 한동안 자리를 뜨지 못하는 영화를 좋아해요. 마음에 남은 장면은 짧은 문장으로 적어둡니다.', symbol: '◉' },
  writing: { title: '메모와 문장', kicker: 'WORDS IN THE MARGIN', text: '흘러가는 생각을 붙잡아두는 작은 메모들. 한 문장이 다른 생각을 불러오곤 해요.', symbol: '✎' },
  music: { title: '밤의 음악', kicker: 'SOUNDTRACK FOR A WALK', text: '저녁 산책의 속도와 잘 맞는 음악을 모아요. 같은 길도 어떤 노래와 걷느냐에 따라 다르게 기억됩니다.', symbol: '♫' },
  walk: { title: '동네 산책', kicker: 'THE LONG WAY HOME', text: '목적지를 정하지 않고 걷다가 낯선 간판이나 작은 가게를 발견하는 걸 좋아해요.', symbol: '⌁' },
  camera: { title: '빛의 기록', kicker: 'LIGHT, HELD STILL', text: '특별한 순간보다 평범한 오후의 빛을 찍어둡니다. 사진은 나중에 기억을 여는 작은 문이 돼요.', symbol: '▧' },
  making: { title: '작은 만들기', kicker: 'IDEAS, MADE TANGIBLE', text: '머릿속에만 있던 아이디어를 화면이나 종이 위에 꺼내보는 일. 생각보다 만드는 과정에서 더 많은 걸 배워요.', symbol: '✳' },
  coffee: { title: '커피와 장소', kicker: 'A TABLE BY THE WINDOW', text: '오래 머물고 싶은 공간에는 저마다의 리듬이 있어요. 창가 자리, 잔의 온기, 느린 오후를 기억합니다.', symbol: '⌂' },
  reading: { title: '책의 여백', kicker: 'DOG-EARED PAGES', text: '책을 읽을 때 밑줄과 접힌 모서리가 늘어납니다. 다른 사람의 문장에서 내 생각을 발견하는 순간이 좋아요.', symbol: '▤' },
  collect: { title: '수집하는 마음', kicker: 'POCKET-SIZED MEMORIES', text: '영수증, 포장지, 이름 모를 작은 조각들. 버리지 않고 모아둔 것들이 예상치 못한 이야기를 들려줍니다.', symbol: '◇' }
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
  while (bfsQueue.length) {
    const current = bfsQueue.shift();
    order.push(current);
    for (const neighbor of graph[current]) {
      if (!seen.has(neighbor)) {
        seen.add(neighbor);
        parents[neighbor] = current;
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
  count.textContent = `${visited.length}/9`;
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

const pathEdges = [[0,1],[1,2],[1,5],[0,4],[4,5],[5,6],[5,8],[4,7],[7,8],[2,6],[0,3],[3,4]];
nodes.forEach(node => node.addEventListener('click', () => startAt(node.dataset.node)));
nextButton.addEventListener('click', showNext);
resetButton.addEventListener('click', () => {
  queue = []; cursor = 0; visited = []; activePath = []; parents = {};
  nodes.forEach(node => node.classList.remove('selected', 'visited'));
  paths.forEach(path => path.classList.remove('active'));
  count.textContent = '0/9';
  pathList.textContent = '아직 출발 전이에요';
  content.innerHTML = '<div class="card-symbol">?</div><p class="card-kicker">어디서 시작할까요?</p><h3>마음 가는 원을<br>하나 골라주세요.</h3><p class="card-description">가까운 관심사부터 연결을 따라가며 이 작은 지도를 탐험할 수 있어요.</p>';
  nextButton.disabled = true;
  nextButton.textContent = '다음 샛길 찾기';
});
