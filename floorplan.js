;(function () {
  'use strict'

  // ─── FLOORPLAN IMAGE ────────────────────────────────────────────
  // Replace this URL with your actual floorplan image
  const FP_IMAGE_URL = 'https://ik.imagekit.io/pwzaetheh/24-4BHK%20%20F_Even%20Floor_TOP%20VIEW_Enlarged_Tower_03.jpg?updatedAt=1777903887248'

  // ─── STATE ──────────────────────────────────────────────────────
  let activeZone = null

  // ─── INJECT FLOORPLAN LAYER HTML ────────────────────────────────
  // Creates: #fp-layer (container), #fp-img (the plan image), #fp-svg (polygon overlay)
  function injectLayer () {
    if (document.getElementById('fp-layer')) return // already injected

    const layer = document.createElement('div')
    layer.id = 'fp-layer'
    layer.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 10;
      display: none;
      align-items: center;
      justify-content: center;
      background: rgba(8, 8, 10, 0.92);
    `

    // Floorplan image
    const img = document.createElement('img')
    img.id = 'fp-img'
    img.alt = 'Floor Plan'
    img.style.cssText = `
      position: absolute;
      max-width: 88vw;
      max-height: 88vh;
      object-fit: contain;
      border-radius: 6px;
      display: block;
      user-select: none;
      -webkit-user-drag: none;
    `

    // SVG overlay — sized via JS once image loads
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.id = 'fp-svg'
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    svg.style.cssText = `
      position: absolute;
      pointer-events: all;
      overflow: visible;
    `

    // Tooltip label
    const tip = document.createElement('div')
    tip.id = 'fp-tip'
    tip.style.cssText = `
      position: fixed;
      bottom: 36px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(10, 8, 5, 0.88);
      color: #f0ebe0;
      border: 1px solid rgba(201, 162, 58, 0.7);
      padding: 6px 18px;
      border-radius: 20px;
      font-size: 12px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s;
      font-family: inherit;
      z-index: 20;
    `

    layer.appendChild(img)
    layer.appendChild(svg)
    layer.appendChild(tip)
    document.body.appendChild(layer)

    // Load the floorplan image then size SVG to match
    img.onload = function () {
      sizeSVG()
    }
    img.src = FP_IMAGE_URL

    window.addEventListener('resize', sizeSVG)
  }

  // ─── SIZE SVG TO MATCH RENDERED IMAGE ───────────────────────────
  function sizeSVG () {
    const img = document.getElementById('fp-img')
    const svg = document.getElementById('fp-svg')
    if (!img || !svg) return

    const rect = img.getBoundingClientRect()
    svg.setAttribute('width',  rect.width)
    svg.setAttribute('height', rect.height)
    svg.setAttribute('viewBox', `0 0 ${img.naturalWidth || 1056} ${img.naturalHeight || 580}`)
    svg.style.left   = rect.left + 'px'
    svg.style.top    = rect.top  + 'px'
    svg.style.width  = rect.width  + 'px'
    svg.style.height = rect.height + 'px'
  }

  // ─── ZONES DEFINITION ───────────────────────────────────────────
  // Coordinates match the original floorplan.js — untouched
  const zones = [
    { room: 'living',        label: 'Living & Dining',    points: '478,206 702,206 702,506 478,506',  fill: 'rgba(0,220,0,0.18)',    stroke: 'rgba(0,220,0,0.9)' },
    { room: 'masterBedroom', label: 'Master Bedroom',     points: '235,184 356,184 356,455 235,455',  fill: 'rgba(255,200,0,0.18)',  stroke: 'rgba(255,200,0,0.9)' },
    { room: 'kidsBedroom',   label: 'Kids Bedroom',       points: '360,248 475,248 475,506 360,506',  fill: 'rgba(60,140,255,0.18)', stroke: 'rgba(60,140,255,0.9)' },
    { room: 'guestBedroom1', label: 'Guest Bedroom',      points: '704,248 820,248 820,455 704,455',  fill: 'rgba(255,80,140,0.18)', stroke: 'rgba(255,80,140,0.9)' },
    { room: 'kitchen',       label: 'Kitchen',            points: '482,70 705,70 705,205 482,205',    fill: 'rgba(255,80,80,0.18)',  stroke: 'rgba(255,80,80,0.9)' },
    { room: 'guestBedroom2', label: 'Guest Bedroom 2',    points: '236,70 478,70 478,188 236,188',    fill: 'rgba(180,60,255,0.18)', stroke: 'rgba(180,60,255,0.9)' },
    { room: 'foyer',         label: 'Foyer / Lobby',      points: '705,67 820,67 820,248 705,248',    fill: 'rgba(0,204,204,0.18)',  stroke: 'rgba(0,204,204,0.9)' }
  ]

  // ─── BUILD POLYGON ZONES ─────────────────────────────────────────
  function buildZones () {
    const svg = document.getElementById('fp-svg')
    if (!svg) return

    // Clear existing
    while (svg.firstChild) svg.removeChild(svg.firstChild)

    zones.forEach(zone => {
      const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
      poly.setAttribute('class', 'fpz')
      poly.setAttribute('points', zone.points)
      poly.setAttribute('fill', zone.fill)
      poly.setAttribute('stroke', zone.stroke)
      poly.setAttribute('stroke-width', '2')
      poly.dataset.room  = zone.room
      poly.dataset.label = zone.label
      poly.style.cursor  = 'pointer'
      poly.style.transition = 'filter 0.15s'
      svg.appendChild(poly)
    })

    // Hover
    svg.addEventListener('mouseover', e => {
      const z = e.target.closest('.fpz')
      if (!z) return
      z.style.filter = 'brightness(1.6)'
      showTip(z.dataset.label || z.dataset.room)
    })

    svg.addEventListener('mouseout', e => {
      const z = e.target.closest('.fpz')
      if (!z) return
      z.style.filter = ''
      hideTip()
    })

    // Click → switch to 360 viewer
    svg.addEventListener('click', e => {
      const z = e.target.closest('.fpz')
      if (!z) return
      const roomKey = z.dataset.room
      if (roomKey) goTo360(roomKey)
    })
  }

  // ─── TOOLTIP ────────────────────────────────────────────────────
  function showTip (text) {
    const tip = document.getElementById('fp-tip')
    if (!tip) return
    tip.textContent = text
    tip.style.opacity = '1'
  }

  function hideTip () {
    const tip = document.getElementById('fp-tip')
    if (tip) tip.style.opacity = '0'
  }

  // ─── SWITCH TO 360 VIEWER ───────────────────────────────────────
  // Tells AppView to show the 360 layer, then fires loadRoom in main.js
  function goTo360 (roomKey) {
    if (window.AppView) window.AppView.switchTo('360')
    // loadRoom is global from main.js
    if (typeof loadRoom === 'function') {
      loadRoom(roomKey)
    }
  }

  // ─── SHOW / HIDE FLOORPLAN LAYER ────────────────────────────────
  // Called by AppView — floorplan.js owns its own visibility
  function show () {
    const layer = document.getElementById('fp-layer')
    if (!layer) return
    layer.style.display = 'flex'
    sizeSVG()           // re-sync SVG position after layout shift
    buildZones()        // rebuild in case SVG was cleared
  }

  function hide () {
    const layer = document.getElementById('fp-layer')
    if (layer) layer.style.display = 'none'
    hideTip()
  }

  // ─── PUBLIC API ─────────────────────────────────────────────────
  window.FloorPlan = { show, hide }

  // ─── INIT ───────────────────────────────────────────────────────
  injectLayer()

})()