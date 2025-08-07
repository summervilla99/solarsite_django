from django.shortcuts import render

def index(request):
    context = {
        'name': '지환',
        'users': [
            {'name': '필준'},
            {'name': '지민'},
            {'name': '혁태'},
        ]
    }

    return render(request, 'index.html', context)

def simple_map(request):
    return render(request, 'index.html')

# def map_view(request):
#     land_data = LandCategory.objects.all()[:100]  # 성능 위해 100개만
#     locations = []

#     for land in land_data:
#         if land.geom:
#             locations.append({
#                 'jibun': land.jibun,
#                 'region': land.region,
#                 'lat': land.geom.y,   # POINT(x y)에서 y=위도, x=경도
#                 'lng': land.geom.x,
#             })

#     context = {'locations': locations}
#     return render(request, 'map.html', context)