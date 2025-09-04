document.addEventListener("DOMContentLoaded", function () {
  // ==========================
  // 지도 초기화
  // ==========================
  const map = L.map("map").setView([36.5, 127.8], 8);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  // ==========================
  // 체크박스 상태 저장
  // ==========================
  const checkboxes = document.querySelectorAll(".jibun-check");
  let selectedJimok = [];

  // ==========================
  // 투명도 슬라이더 이벤트
  // ==========================
  const opacitySlider = document.getElementById("land-opacity");
  const opacityValue = document.getElementById("opacity-value");
  let currentOpacity = opacitySlider.value / 100;

  // ==========================
  // MVT 타일 레이어 (재생성 방식으로 스타일 반영)
  // ==========================
  let landTiles = null;

  function rebuildVectorTiles() {
    if (landTiles) {
      map.removeLayer(landTiles);
      landTiles = null;
    }
    landTiles = L.vectorGrid.protobuf("/tiles/{z}/{x}/{y}.pbf", {
      vectorTileLayerStyles: {
        // VectorLayer.id ("jimok")와 반드시 동일!
        jimok: props => {
          const isSelected = selectedJimok.includes(props.jimok);
          return {
            fillColor: isSelected ? "pink" : "transparent",
            color: isSelected ? "#d310b9ff" : "transparent",
            weight: isSelected ? 1 : 0,
            fillOpacity: isSelected ? currentOpacity : 0
          };
        }
      },
      maxNativeZoom: 18,
      rendererFactory: L.canvas.tile
    }).addTo(map);
  }

  // 최초 1회 생성
  rebuildVectorTiles();

  // ==========================
  // 체크박스 이벤트 (스타일 갱신)
  // ==========================
  checkboxes.forEach((cb) => {
    cb.addEventListener("change", () => {
      selectedJimok = Array.from(checkboxes)
        .filter((c) => c.checked)
        .map((c) => c.value);
      console.log("선택된 지목:", selectedJimok);

      // 🔁 setStyle() 대신 레이어 재생성
      rebuildVectorTiles();
    });
  });

  // ==========================
  // 투명도 슬라이더 이벤트 (스타일 갱신)
  // ==========================
  opacitySlider.addEventListener("input", () => {
    currentOpacity = opacitySlider.value / 100;
    opacityValue.textContent = opacitySlider.value + "%";

    // 🔁 setStyle() 대신 레이어 재생성
    rebuildVectorTiles();
  });

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
  // 지역 검색 박스 토글
  // ==========================
  function toggleSearchBox() {
    const box = document.getElementById("search-box");
    const sidebar = document.querySelector(".sidebar");
    const show = box.style.display === "none";
    box.style.display = show ? "block" : "none";
    sidebar.classList.toggle("sidebar-expanded", show);
  }

  // ==========================
  // 주소 검색 실행
  // ==========================
  async function searchAddress() {
    const address = document.getElementById("address-input").value;
    if (!address) return alert("주소를 입력하세요.");

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
          L.marker([lat, lng])
            .addTo(map)
            .bindPopup(`${address}<br>📍 ${lat.toFixed(6)}, ${lng.toFixed(6)}`)
            .openPopup();
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
  document
    .getElementById("btn-search")
    .addEventListener("click", toggleSearchBox);
  document
    .getElementById("btn-address-search")
    .addEventListener("click", searchAddress);
});
