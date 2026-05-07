(function () {

  const svg = document.getElementById('fp-svg');

  const zones = [
    { room: 'living',        points: '478,206 702,206 702,506 478,506',   fill: 'rgba(0,220,0,0.18)',     stroke: 'rgba(0,220,0,0.9)' },
    { room: 'masterBedroom', points: '235,184 356,184 356,455 235,455',   fill: 'rgba(255,200,0,0.18)',   stroke: 'rgba(255,200,0,0.9)' },
    { room: 'kidsBedroom',   points: '360,248 475,248 475,506 360,506',   fill: 'rgba(60,140,255,0.18)',  stroke: 'rgba(60,140,255,0.9)' },
    { room: 'guestBedroom1', points: '704,248 820,248 820,455 704,455',   fill: 'rgba(255,80,140,0.18)',  stroke: 'rgba(255,80,140,0.9)' },
    { room: 'kitchen',       points: '482,70 705,70 705,205 482,205',     fill: 'rgba(255,80,80,0.18)',   stroke: 'rgba(255,80,80,0.9)' },
    { room: 'guestBedroom2', points: '236,70 478,70 478,188 236,188',     fill: 'rgba(180,60,255,0.18)', stroke: 'rgba(180,60,255,0.9)' },
    { room: 'foyer',         points: '705,67 820,67 820,248 705,248',     fill: 'rgba(0,204,204,0.18)',   stroke: 'rgba(0,204,204,0.9)' }
  ];

  zones.forEach(zone => {
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('class', 'fpz');
    polygon.setAttribute('points', zone.points);
    polygon.setAttribute('fill', zone.fill);
    polygon.setAttribute('stroke', zone.stroke);
    polygon.setAttribute('stroke-width', '2');
    polygon.dataset.room = zone.room;
    svg.appendChild(polygon);
  });

  svg.addEventListener('click', (e) => {
    const target = e.target.closest('.fpz');
    if (!target) return;
    const roomKey = target.dataset.room;
    if (roomKey) fpGo(roomKey);
  });

  function fpGo(roomKey) {

  if(typeof enterViewer === 'function'){
    enterViewer(roomKey)
  }

}

})();