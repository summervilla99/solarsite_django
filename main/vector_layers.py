# main/vector_layers.py
from vectortiles import VectorLayer
from .models import Jimok

class JimokVectorLayer(VectorLayer):
    model = Jimok
    id = "jimok"                 # ← 프론트에서 vectorTileLayerStyles 키와 동일
    tile_fields = ("gid", "jibun", "jimok")
    geom_field = "geom"          # ← 모델의 지오메트리 필드명
    # 필요하면 min_zoom / max_zoom 도 설정 가