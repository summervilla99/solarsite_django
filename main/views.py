from django.shortcuts import render
from django.conf import settings
from django.http import JsonResponse
from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import Transform
from django.contrib.gis.measure import D
from django.contrib.gis.geos import Polygon
from .models import LandCategory
from django.db import connection
import requests, json, re


def index(request):
    return render(request, 'main/index.html', {
        'vworld_key': settings.VWORLD_API_KEY
    })


def vworld_geocode(request):
    address = request.GET.get("address")
    for addr_type in ["road", "parcel"]:
        res = requests.get(
            "https://api.vworld.kr/req/address",
            params={
                "service": "address",
                "request": "getcoord",
                "format": "json",
                "type": addr_type,
                "key": settings.VWORLD_API_KEY,
                "address": address,
            },
            timeout=5
        )
        data = res.json()
        if data["response"]["status"] == "OK":
            return JsonResponse(data)
    return JsonResponse({"response": {"status": "NOT_FOUND"}}, status=404)


def extract_jimok(jibun: str):
    if not jibun:
        return ""

    cleaned = jibun.strip()
    # 끝 두 글자 중 숫자/공백 제거
    last_two = ''.join([c for c in cleaned[-2:] if c.isalpha()])

    # 그룹 A: 포함만 되면 불가
    group_a = ["전", "답", "과"]
    for g in group_a:
        if g in cleaned:
            return g

    # 그룹 B: 끝 두 글자 정확히 일치해야 불가
    group_b = ["염전", "임야", "양어장"]
    if last_two in group_b:
        return last_two

    return ""

def filter_land(request):
    try:
        # 요청 파라미터 받기
        lat = float(request.GET.get("lat"))
        lng = float(request.GET.get("lng"))
        radius = float(request.GET.get("radius", 2000))

        disallowed = request.GET.get("disallowed", "")
        disallowed_list = [x.strip() for x in disallowed.split(",") if x]

        # 검색 좌표 (WGS84 → 5186 변환)
        point = Point(lng, lat, srid=4326)
        point.transform(5186)

        qs = LandCategory.objects.filter(
            geom__distance_lte=(point, D(m=radius))
        )

        features = []
        for obj in qs:
            jibun = obj.jibun or ""
            jimok = extract_jimok(jibun)

            if jimok in disallowed_list:
                geom_4326 = obj.geom.transform(4326, clone=True)
                # geometry = json.loads(geom_4326.geojson)
                geometry = json.loads(geom_4326.simplify(5, preserve_topology=True).geojson)

                features.append({
                    "type": "Feature",
                    "geometry": geometry,
                    "properties": {
                        "gid": obj.gid,
                        "jibun": jibun,
                        "pnu": obj.pnu,
                        "jimok": jimok,
                        "color": "pink"
                    }
                })

        return JsonResponse({
            "type": "FeatureCollection",
            "features": features
        })

    except Exception as e:
        print("[API ERROR]", e)
        return JsonResponse({"error": str(e)}, status=500)