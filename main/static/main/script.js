document.addEventListener("DOMContentLoaded", function () {
  // ==========================
  // 지도 초기화
  // ==========================
  const map = L.map('map').setView([36.5, 127.8], 8);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  let landLayer = null; // 필터링된 필지 레이어 저장
  window.map = map;

  // ==========================
  // 부지 필터링 박스 토글
  // ==========================
  const btnFilter = document.getElementById("btn-filter");
  const filterBox = document.getElementById("filter-box");

  btnFilter.addEventListener("click", () => {
    const show = filterBox.style.display === "none";
    filterBox.style.display = show ? "block" : "none";
  });

  // ==========================
  // 투명도 슬라이더 이벤트
  // ==========================
  const opacitySlider = document.getElementById("land-opacity");
  const opacityValue = document.getElementById("opacity-value");

  opacitySlider.addEventListener("input", () => {
    opacityValue.textContent = opacitySlider.value + "%";
    if (landLayer) {
      landLayer.setStyle({
        fillOpacity: opacitySlider.value / 100
      });
    }
  });

  // ==========================
  // 지목 체크박스 이벤트 + API 호출
  // ==========================
  const checkboxes = document.querySelectorAll(".jibun-check");

  async function updateFilterLayer(lat, lng) {
    const selected = Array.from(checkboxes)
      .filter(c => c.checked)
      .map(c => c.value);

    console.log("선택된 지목:", selected);

    const url = `/api/filter/?lat=${lat}&lng=${lng}&radius=2000&disallowed=${selected.join(",")}`;
    try {
      const res = await fetch(url);
      const geojson = await res.json();
      
      console.log("📦 받은 GeoJSON:", geojson);
      
      // 기존 레이어 제거
      if (landLayer) {
        map.removeLayer(landLayer);
      }

      // 새 레이어 추가
      landLayer = L.geoJSON(geojson, {
        style: feature => ({
          color: feature.properties.color,
          weight: 2,
          fillOpacity: opacitySlider.value / 100 || 0.5
        }),
        onEachFeature: (feature, layer) => {
          layer.bindPopup(`📍 ${feature.properties.jibun}<br>PNU: ${feature.properties.pnu}`);
        },
        renderer: L.canvas()
      }).addTo(map);

      // ✅ fitBounds 여기서 실행
      // try {
      //   const bounds = landLayer.getBounds();
      //   if (bounds.isValid()) {
      //     map.fitBounds(bounds);
      //   }
      // } catch (e) {
      //   console.warn("bounds 계산 실패:", e);
      // }

    } catch (err) {
      console.error("필터 API 오류:", err);
    }
  }

  // ==========================
  // 체크박스 변경 시 → 현재 중심 좌표 기준 필터링
  // ==========================
  checkboxes.forEach(cb => {
    cb.addEventListener("change", () => {
      const center = map.getCenter();
      updateFilterLayer(center.lat, center.lng);
    });
  });

  // ==========================
  // 지역 검색 박스 토글
  // ==========================
  function toggleSearchBox() {
    const box = document.getElementById('search-box');
    const sidebar = document.querySelector('.sidebar');
    const show = box.style.display === 'none';
    box.style.display = show ? 'block' : 'none';
    sidebar.classList.toggle('sidebar-expanded', show);
  }

  // ==========================
  // 주소 검색 실행
  // ==========================
  async function searchAddress() {
    const address = document.getElementById('address-input').value;
    if (!address) return alert('주소를 입력하세요.');

    const types = ["road", "parcel"];
    for (let type of types) {
      const url = `/api/geocode?address=${encodeURIComponent(address)}`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.response.status === "OK") {
          const point = data.response.result.point;
          const lat = parseFloat(point.y);
          const lng = parseFloat(point.x);

          map.setView([lat, lng], 16);
          L.marker([lat, lng]).addTo(map)
            .bindPopup(`${address}<br>📍 ${lat.toFixed(6)}, ${lng.toFixed(6)}`)
            .openPopup();

          // 📌 검색한 좌표 기준으로 필터링 실행
          updateFilterLayer(lat, lng);
          return;
        }
      } catch (e) {
        console.warn(`[검색 실패 - ${type}]`, e);
      }
    }

    alert("❌ 주소를 찾을 수 없습니다.");
  }

  // ==========================
  // 이벤트 바인딩
  // ==========================
  document.getElementById("btn-search").addEventListener("click", toggleSearchBox);
  document.getElementById("btn-address-search").addEventListener("click", searchAddress);
});
