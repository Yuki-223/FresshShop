/**
 * Province → city → district data for the Chinese address picker.
 * A representative subset for the demo; a real store would load the full
 * administrative-division dataset (≈3,000 districts) from an API.
 */
export const chinaRegions: { name: string; cities: { name: string; districts: string[] }[] }[] = [
  { name: "北京市", cities: [{ name: "北京市", districts: ["东城区", "西城区", "朝阳区", "海淀区", "丰台区"] }] },
  { name: "上海市", cities: [{ name: "上海市", districts: ["黄浦区", "徐汇区", "静安区", "浦东新区", "闵行区"] }] },
  {
    name: "广东省",
    cities: [
      { name: "广州市", districts: ["天河区", "越秀区", "海珠区", "番禺区"] },
      { name: "深圳市", districts: ["南山区", "福田区", "罗湖区", "宝安区"] },
    ],
  },
  {
    name: "浙江省",
    cities: [
      { name: "杭州市", districts: ["西湖区", "上城区", "拱墅区", "滨江区"] },
      { name: "宁波市", districts: ["海曙区", "鄞州区", "江北区"] },
    ],
  },
  {
    name: "江苏省",
    cities: [
      { name: "南京市", districts: ["玄武区", "秦淮区", "鼓楼区", "建邺区"] },
      { name: "苏州市", districts: ["姑苏区", "苏州工业园区", "吴中区"] },
    ],
  },
  { name: "四川省", cities: [{ name: "成都市", districts: ["锦江区", "武侯区", "青羊区", "成华区"] }] },
]
