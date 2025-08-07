# from django.db import models
from django.contrib.gis.db import models

class LandCategory(models.Model):
    gid = models.IntegerField(primary_key=True)
    sgg_oid = models.IntegerField()
    jibun = models.CharField(max_length=255, blank=True, null=True)
    bchk = models.CharField(max_length=255, blank=True, null=True)
    pnu = models.CharField(max_length=255, blank=True, null=True)
    col_adm_se = models.CharField(max_length=255, blank=True, null=True)
    geometry = models.MultiPolygonField(srid=4326)
    region = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'filter"."land_category'
        managed = False