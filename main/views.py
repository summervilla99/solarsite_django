from django.shortcuts import render
from django.conf import settings
from django.http import JsonResponse
import requests

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