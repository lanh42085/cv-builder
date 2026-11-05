import type { CvData } from "./schema";

/** CV mẫu (dữ liệu giả) — dùng cho trang chủ và nạp sẵn khi tạo tài khoản. */
export const SAMPLE_CV: CvData = {
  "schemaVersion": 2,
  "templateId": "ats-single",
  "cvLanguage": "en",
  "style": {
    "font": "times",
    "bodyFont": "times",
    "accent": "#111111",
    "lineHeight": 1.25,
    "sizes": { "name": 15, "heading": 10.5, "body": 10, "section": 10.5 }
  },
  "sectionOrder": [
    "about",
    "skills",
    "projects",
    "experience",
    "education"
  ],
  "basics": {
    "fullName": "Nguyễn Minh An",
    "headline": "Data Analyst",
    "email": "minhan.data@gmail.com",
    "phone": "(+84) 912 345 678",
    "location": "Ho Chi Minh City, Vietnam",
    "linkedin": "linkedin.com/in/minhan-data",
    "github": "github.com/minhan-data",
    "portfolioUrl": ""
  },
  "raw": {
    "aboutMe": {
      "whoAmI": "Tốt nghiệp Hệ thống thông tin quản lý, 1 năm thực tập Data Analyst ngành bán lẻ và fintech",
      "strengths": "SQL, Power BI, Python; dựng Star Schema, viết pipeline ELT tự động",
      "goal": "Dùng dữ liệu để tối ưu bán hàng và vận hành"
    },
    "experience": [
      {
        "id": "e1",
        "company": "Saigon Retail Group",
        "role": "Data Analyst Intern",
        "startDate": "2025-06",
        "endDate": "2025-12",
        "current": false,
        "tasks": [
          {
            "id": "t1",
            "problem": "Báo cáo bán hàng 25 cửa hàng làm tay mỗi tuần, mất 6 giờ và hay sai",
            "what": "Gộp dữ liệu bán hàng và tồn kho thành mô hình Star Schema, dựng dashboard tuần",
            "forWho": "Phòng Kinh doanh và Vận hành",
            "how": "SQL Server, Power Query, Power BI (DAX)",
            "outcome": "Dashboard doanh thu – tồn kho theo cửa hàng, cập nhật tự động",
            "impact": "Giảm thời gian làm báo cáo từ 6 giờ xuống 45 phút mỗi tuần"
          },
          {
            "id": "t2",
            "problem": "Không biết chương trình khuyến mãi nào hiệu quả",
            "what": "Phân tích 18 chiến dịch khuyến mãi theo nhóm hàng và cửa hàng",
            "forWho": "Phòng Marketing",
            "how": "SQL, Excel Pivot",
            "outcome": "Báo cáo hiệu quả khuyến mãi",
            "impact": "Phát hiện 4 chiến dịch lỗ, đề xuất dừng, tiết kiệm ~120 triệu/quý"
          }
        ]
      },
      {
        "id": "e2",
        "company": "PayNow Fintech JSC",
        "role": "Business Intelligence Intern",
        "startDate": "2025-01",
        "endDate": "2025-05",
        "current": false,
        "tasks": [
          {
            "id": "t3",
            "problem": "Tỷ lệ người dùng rời bỏ sau 30 ngày cao, chưa có số đo",
            "what": "Theo dõi KPI kích hoạt và giữ chân người dùng theo cohort",
            "forWho": "Team Growth",
            "how": "BigQuery SQL, Looker Studio",
            "outcome": "Dashboard cohort retention theo tuần",
            "impact": "Xác định bước onboarding gây rớt 35% người dùng, team sửa và tăng retention 30 ngày thêm 8 điểm"
          }
        ]
      }
    ],
    "projects": [
      {
        "id": "p1",
        "name": "Fashion Retail Marketing & Sales Performance Analytics",
        "tools": "Power BI",
        "link": "github.com/minhan-data/fashion-retail-analytics",
        "situation": "Đánh giá hiệu quả quảng cáo số so với doanh thu của chuỗi thời trang",
        "task": "Gộp 2.858 đơn hàng (4,77 tỷ VND) với chi tiêu quảng cáo đa chiến dịch (394 triệu VND)",
        "action": "Star Schema trong Power BI, DAX",
        "result": "ROAS ~7,7; quảng cáo số đóng góp 63,3% doanh thu; 3 SKU chủ lực chiếm >70% doanh thu từ ads; đề xuất mở rộng kênh organic"
      },
      {
        "id": "p2",
        "name": "Global Supply Chain & Operations Intelligence",
        "tools": "Power BI",
        "link": "github.com/minhan-data/supply-chain-intelligence",
        "situation": "Tìm nguyên nhân doanh thu giảm dù đơn hàng tăng",
        "task": "Mô hình hoá 180.519 bản ghi chuỗi cung ứng (36,78 triệu USD) thành Star Schema 5 chiều",
        "action": "Power BI, DAX",
        "result": "Đơn tăng 4,8% YoY nhưng doanh thu giảm 4,0% do AOV giảm 8,5%; tỷ lệ giao trễ 54,82% (~20 triệu USD rủi ro); đề xuất đàm phán lại SLA và định tuyến lại kho"
      },
      {
        "id": "p3",
        "name": "E-Commerce Analytics & Conversion Funnel Optimization",
        "tools": "SQL, BigQuery",
        "link": "github.com/minhan-data/ecommerce-funnel",
        "situation": "Tìm điểm rớt trong phễu chuyển đổi của website TMĐT",
        "task": "Phân tích log phiên Google Analytics 360",
        "action": "BigQuery Standard SQL: array unnesting, CTE, window function",
        "result": "Người không mua xem ~3x pageview (317 vs 94) do tìm kiếm khó; direct traffic mang 97,3K USD với tỷ lệ chuyển đổi 2,48%; đề xuất tối ưu landing page cho kênh social"
      },
      {
        "id": "p4",
        "name": "Sales Analytics Data Pipeline (Medallion Architecture)",
        "tools": "Python, PostgreSQL",
        "link": "github.com/minhan-data/sales-elt-pipeline",
        "situation": "File vận hành thô không dùng được cho báo cáo",
        "task": "Xây pipeline ELT 3 tầng Bronze → Silver → Gold",
        "action": "Python loader có metadata ingestion, SQL làm sạch/ép kiểu/kiểm tra schema, Star Schema marts (Fact Sales, Targets, Returns)",
        "result": "Dữ liệu sẵn sàng cho BI, theo dõi hiệu suất nhà phân phối nhanh hơn"
      },
      {
        "id": "p5",
        "name": "E-Commerce Customer Churn Prediction",
        "tools": "Python",
        "link": "github.com/minhan-data/customer-churn",
        "situation": "Dự đoán khách hàng sắp rời bỏ để giữ chân",
        "task": "Mô hình phân loại trên 5.630 khách hàng TMĐT",
        "action": "EDA, feature engineering (RFM, tenure, khiếu nại), Logistic Regression / Random Forest / XGBoost, tối ưu Recall và ROC-AUC",
        "result": "Xác định 3 yếu tố gây churn hàng đầu, ma trận phân khúc rủi ro cho CRM"
      }
    ],
    "skills": {
      "hard": "Database & Querying: SQL (PostgreSQL, BigQuery, SQL Server, CTEs, Window Functions, Complex Joins)\nBI & Visualization: Power BI (DAX, Power Query), Looker Studio\nProgramming: Python (pandas, NumPy), automated ELT pipeline (Medallion Architecture)\nMachine Learning: scikit-learn (Logistic Regression, Random Forest, XGBoost), EDA, Feature Engineering (RFM)\nFrameworks & Tools: Dimensional Modeling (Star Schema), Git/GitHub, Excel (Pivot, Power Query)",
      "soft": "Problem solving: 5W1H, Issue Tree, Empathy Mapping\nCommunication: presenting insights to Sales, Marketing and Growth teams"
    },
    "education": [
      {
        "id": "ed1",
        "school": "University of Economics Ho Chi Minh City",
        "major": "Bachelor of Management Information Systems",
        "years": "Sep 2019 – Sep 2023",
        "gpa": "",
        "note": "**Relevant Coursework:** Database Systems (SQL), Statistics, Python Programming"
      },
      {
        "id": "ed2",
        "school": "UniGap Data Analyst Intensive Program",
        "major": "Professional Specialization: Advanced SQL, Power BI, Python, Machine Learning",
        "years": "Mar 2026 – Oct 2026",
        "gpa": "",
        "note": ""
      }
    ],
    "achievements": [
      {
        "id": "a1",
        "text": "SQL Advanced (HackerRank)",
        "link": ""
      },
      {
        "id": "a2",
        "text": "Power BI (DataCamp)",
        "link": ""
      },
      {
        "id": "a3",
        "text": "Python (DataCamp)",
        "link": ""
      }
    ]
  },
  "generated": {
    "aboutMe": {
      "options": [],
      "chosen": 0,
      "final": "Entry-level Data Analyst with a background in Management Information Systems and internships in retail and fintech. Skilled in building Star Schema models and dashboards in Power BI, writing complex SQL transformations, and engineering automated Python ELT pipelines. Aiming to turn messy operational data into decisions that improve sales and operations."
    },
    "experience": [
      {
        "rawId": "e1",
        "header": "Saigon Retail Group | Data Analyst Intern",
        "bullets": [
          "Consolidated sales and inventory data from 25 stores into a Star Schema model using SQL Server and Power Query, building a weekly Power BI dashboard for the Sales and Operations teams, reducing report preparation time from 6 hours to 45 minutes per week.",
          "Analyzed 18 promotion campaigns by product group and store with SQL and Excel Pivot for the Marketing team, identifying 4 loss-making campaigns and recommending their suspension, saving approximately 120 million VND per quarter."
        ]
      },
      {
        "rawId": "e2",
        "header": "PayNow Fintech JSC | Business Intelligence Intern",
        "bullets": [
          "Tracked activation and retention KPIs by weekly cohort using BigQuery SQL and Looker Studio for the Growth team, identifying an onboarding step with a 35% drop-off; the fix increased 30-day retention by 8 points."
        ]
      }
    ],
    "projects": [
      {
        "rawId": "p1",
        "header": "Fashion Retail Marketing & Sales Performance Analytics | Power BI",
        "bullets": [
          "Integrated 2,858 retail transaction orders (4.77B VND) with multi-campaign digital ad spend (394M VND) into a Star Schema model using Power BI and DAX.",
          "Identified a ~7.7 blended ROAS, revealed digital ads drove 63.3% of revenue, and found 3 hero SKUs generated >70% of ad sales; proposed expanding organic direct channels to reduce ad dependency."
        ]
      },
      {
        "rawId": "p2",
        "header": "Global Supply Chain & Operations Intelligence | Power BI",
        "bullets": [
          "Modeled 180,519 global supply chain records ($36.78M revenue) into a 5-dimension Star Schema using Power BI and DAX.",
          "Discovered order volume grew 4.8% YoY while revenue dropped 4.0% due to an 8.5% AOV decline, and quantified a 54.82% late delivery rate (~$20M at risk); proposed carrier SLA renegotiation and warehouse re-routing."
        ]
      },
      {
        "rawId": "p3",
        "header": "E-Commerce Analytics & Conversion Funnel Optimization | SQL, BigQuery",
        "bullets": [
          "Analyzed Google Analytics 360 e-commerce session logs using BigQuery Standard SQL with multi-level array unnesting, CTEs, and window functions.",
          "Identified non-purchasers browsed ~3x more pageviews (~317 vs 94) due to search friction, and revealed direct traffic drove $97.3K revenue with a 2.48% conversion rate; recommended landing page optimization for high-bounce social channels."
        ]
      },
      {
        "rawId": "p4",
        "header": "Sales Analytics Data Pipeline (Medallion Architecture) | Python, PostgreSQL",
        "bullets": [
          "Architected a 3-tier automated ELT pipeline (Bronze → Silver → Gold) with Python loaders capturing audit ingestion metadata and SQL routines enforcing deduplication, type casting, and schema validation.",
          "Modeled Star Schema marts (Fact Sales, Targets, Returns and Dimension tables), accelerating query throughput for downstream BI reporting and distributor performance tracking."
        ]
      },
      {
        "rawId": "p5",
        "header": "E-Commerce Customer Churn Prediction | Python",
        "bullets": [
          "Built a predictive churn model on 5,630 e-commerce customer records with EDA and feature engineering (RFM metrics, tenure, complaint frequency, payment preferences).",
          "Trained Logistic Regression, Random Forest and XGBoost; optimized for Recall and ROC-AUC to isolate the top 3 churn drivers and formulated an account risk segmentation matrix for CRM targeting."
        ]
      }
    ],
    "notes": ""
  }
} as CvData;
