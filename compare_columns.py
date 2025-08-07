import geopandas as gpd

def get_column_names(shp_path):
    gdf = gpd.read_file(shp_path)
    return list(gdf.columns)

def compare_columns(shp1_path, shp2_path):
    cols1 = get_column_names(shp1_path)
    cols2 = get_column_names(shp2_path)

    print(f"📂 {shp1_path} 컬럼 목록:")
    print(cols1)
    print()

    print(f"📂 {shp2_path} 컬럼 목록:")
    print(cols2)
    print()

    if cols1 == cols2:
        print("✅ 두 shp 파일의 컬럼명이 **완전히 일치**합니다.")
    else:
        print("❌ 컬럼명이 다릅니다.")
        print("📌 다음 항목들을 확인하세요:")

        set1 = set(cols1)
        set2 = set(cols2)

        only_in_1 = set1 - set2
        only_in_2 = set2 - set1

        if only_in_1:
            print(f" - {shp1_path}에만 있는 컬럼: {only_in_1}")
        if only_in_2:
            print(f" - {shp2_path}에만 있는 컬럼: {only_in_2}")

        # 순서 비교
        if set1 == set2 and cols1 != cols2:
            print("⚠️ 컬럼 구성은 같지만 **순서가 다릅니다**.")

if __name__ == "__main__":
    # 경로에 있는 두 .shp 파일 비교
    path1 = "data/cb_jp/LSMD_CONT_LDREG_43745_202507.shp"
    path2 = "data/cn_ss/LSMD_CONT_LDREG_44210_202507.shp" # 예시

    compare_columns(path1, path2)