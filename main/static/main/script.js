document.addEventListener("DOMContentLoaded", function () {
    const map = L.map('map').setView([36.5, 127.8], 8);
  
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
  
    window.map = map;
  
    // 지역 검색박스 토글
    window.toggleSearchBox = function () {
      const box = document.getElementById('search-box');
      const sidebar = document.querySelector('.sidebar');
      const show = box.style.display === 'none';
      box.style.display = show ? 'block' : 'none';
      sidebar.classList.toggle('sidebar-expanded', show);
    };
  
    // 주소 검색 → VWorld API → 지도 이동 + 마커
    window.searchAddress = async function () {
      const address = document.getElementById('address-input').value;
      if (!address) return alert('주소를 입력하세요.');
  
      const types = ["road", "parcel"];
      for (let type of types) {
        // const url = `https://api.vworld.kr/req/address?service=address&request=getcoord&format=json&type=${type}&key=${VWORLD_API_KEY}&address=${encodeURIComponent(address)}`;
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
            return;
          }
        } catch (e) {
          console.warn(`[검색 실패 - ${type}]`, e);
        }
      }
  
      alert("❌ 주소를 찾을 수 없습니다.");
    };
  });
  