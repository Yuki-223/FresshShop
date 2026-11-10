# FresshShop 简化版逻辑 ER 图

只画业务上真正存在的东西，一共 14 个实体。数据库里实际的 41 张表见 [er-diagram.md](./er-diagram.md)。

图片版：[er-diagram-simple.png](./er-diagram-simple.png)、[er-diagram-simple.svg](./er-diagram-simple.svg)

简化的方法：

- **合并模块连接表**：价格、库存在 Medusa 里是独立模块，这里直接作为“规格”的属性。
- **多对多直接画成 M:N**：比如商品和分类，中间表省略。
- **快照写成字段**：购物车、订单里复制的地址写成 `shipping_address` 字段，不单独成表。
- **去掉订单版本表**：`order_item / order_shipping / order_summary` 的版本信息不画。
- **去掉框架内部拆分**：登录身份、支付会话、多币种价格集合等。

```mermaid
erDiagram
    CATEGORY |o--o{ CATEGORY : "父分类"
    CATEGORY }o--o{ PRODUCT : "包含"
    PRODUCT ||--o{ PRODUCT_IMAGE : "有"
    PRODUCT ||--|{ VARIANT : "有"
    PRODUCT ||--o{ REVIEW : "收到"

    CUSTOMER ||--o{ ADDRESS : "保存"
    CUSTOMER |o--o{ CART : "拥有"
    CART ||--o{ CART_ITEM : "包含"
    VARIANT ||--o{ CART_ITEM : "被加入"
    SHIPPING_OPTION |o--o{ CART : "被选择"

    CART |o--o| ORDER : "结账生成"
    CUSTOMER |o--o{ ORDER : "下单"
    ORDER ||--|{ ORDER_ITEM : "包含"
    VARIANT ||--o{ ORDER_ITEM : "被购买"
    SHIPPING_OPTION ||--o{ ORDER : "配送"
    ORDER ||--o{ PAYMENT : "支付"

    CATEGORY["分类 Category"] {
        string id PK
        string name "名称"
        string handle "URL 标识"
        string parent_id FK "上级分类"
    }
    PRODUCT["商品 Product"] {
        string id PK
        string title "商品名"
        string handle "URL 标识"
        string description "描述"
        string thumbnail "主图"
        json rating "评分与评价数"
        json details "成分表、用法、注意事项、FAQ"
    }
    PRODUCT_IMAGE["商品图片 Image"] {
        string id PK
        string product_id FK
        string url "图片地址"
        int rank "排序"
    }
    VARIANT["规格 Variant"] {
        string id PK
        string product_id FK
        string sku "货号"
        string size "规格，如 60 粒"
        string flavor "口味"
        decimal price "售价 USD"
        int stock "库存"
        json subscriptions "订阅价"
    }
    REVIEW["评价 Review"] {
        string id PK
        string product_id FK
        string author_name "作者"
        int rating "1-5 星"
        string title "标题"
        string content "内容"
        string source "采集或客户撰写"
        datetime published_at "发布时间"
    }
    CUSTOMER["客户 Customer"] {
        string id PK
        string email "邮箱，也是登录名"
        string password_hash "密码"
        string first_name "名"
        string last_name "姓"
        string phone "电话"
    }
    ADDRESS["地址 Address"] {
        string id PK
        string customer_id FK
        string address_1 "街道"
        string city "城市"
        string province "州或省"
        string postal_code "邮编"
        string country_code "国家"
        bool is_default "默认地址"
    }
    CART["购物车 Cart"] {
        string id PK
        string customer_id FK "可为空，游客购物车"
        string shipping_option_id FK
        string email "联系邮箱"
        json shipping_address "收货地址快照"
        string promo_code "优惠码"
        datetime completed_at "结账时间"
    }
    CART_ITEM["购物车商品 CartItem"] {
        string id PK
        string cart_id FK
        string variant_id FK
        int quantity "数量"
        decimal unit_price "单价"
    }
    SHIPPING_OPTION["配送方式 ShippingOption"] {
        string id PK
        string name "名称"
        decimal amount "运费"
    }
    ORDER["订单 Order"] {
        string id PK
        int display_id "订单号"
        string customer_id FK
        string cart_id FK
        string shipping_option_id FK
        string email "联系邮箱"
        string status "状态"
        json shipping_address "收货地址快照"
        decimal shipping_amount "运费"
        decimal total "总金额"
        datetime created_at "下单时间"
    }
    ORDER_ITEM["订单商品 OrderItem"] {
        string id PK
        string order_id FK
        string variant_id FK
        string title "商品名快照"
        string sku "货号快照"
        int quantity "数量"
        decimal unit_price "成交单价"
    }
    PAYMENT["支付 Payment"] {
        string id PK
        string order_id FK
        string provider "支付方式"
        decimal amount "金额"
        string status "状态"
        datetime captured_at "收款时间"
    }
```

## 和实际数据表的对应关系

| 逻辑实体 | 实际表 |
|---|---|
| 分类 | `product_category`，以及 `product_category_product`（多对多中间表） |
| 商品 | `product`，以及 `product_collection`；成分表等详情在 `product.metadata` 里 |
| 商品图片 | `image` |
| 规格 | `product_variant`；尺码和口味来自 `product_option`、`product_option_value`、`product_variant_option`、`product_product_option`、`product_product_option_value` |
| 规格的价格 | `product_variant_price_set` → `price_set` → `price` |
| 规格的库存 | `product_variant_inventory_item` → `inventory_item` → `inventory_level` |
| 评价 | `review`（我们自定义的模块） |
| 客户 | `customer`；登录信息在 `auth_identity`、`provider_identity` |
| 地址 | `customer_address` |
| 购物车 | `cart`、`cart_address` |
| 购物车商品 | `cart_line_item` |
| 配送方式 | `shipping_option`，以及 `cart_shipping_method`、`order_shipping_method`（选中时的快照） |
| 订单 | `order`、`order_address`、`order_cart`、`order_summary`、`order_shipping` |
| 订单商品 | `order_line_item`、`order_item` |
| 支付 | `payment_collection`、`payment_session`、`payment`，以及 `cart_payment_collection`、`order_payment_collection` |

几点说明：

- 简化图里的 `password_hash`、`promo_code`、`total` 是逻辑上的字段。实际上它们在其他表里，或者是计算出来的：
  - 密码存在 `provider_identity.provider_metadata`。
  - 优惠码通过 `promotion` 关联，目前还没有使用数据。
  - 订单总额存在 `order_summary.totals`。
- 实际数据库里，支付挂在购物车上，通过 `payment_collection` 关联，下单时再关联到订单。简化图直接画成“订单 → 支付”。
