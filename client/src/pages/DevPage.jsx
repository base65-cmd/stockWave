// src/pages/DevPage.jsx
import { Link } from "react-router-dom";
import { Card, Typography, List, Button } from "antd";
import { ToolOutlined, ArrowRightOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

const activePages = [
  { name: "Dashboard", path: "/" },
  { name: "Inventory List", path: "/inventory" },
  { name: "Add Items", path: "/inventory/create" },
  { name: "SIS", path: "/sis" },
  { name: "Transaction History", path: "/sis-transactions" },
  { name: "Vessel Overview", path: "/vessel" },
  { name: "e-BinCard", path: "/ebincard" },
  { name: "Low Stock", path: "/low-stock" },
  { name: "Purchase Orders", path: "/purchase-order" },
  { name: "Vendor Directory", path: "/vendor" },
];

export default function DevPage({ title }) {
  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-[#f7f7f7] p-6">
      <Card
        className="w-full max-w-3xl shadow-md"
        bordered={false}
        style={{ borderRadius: "16px" }}
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <ToolOutlined style={{ fontSize: "40px", color: "#1677ff" }} />
          </div>
          <Title level={2}>{title} – Under Construction 🚧</Title>
          <Paragraph type="secondary">
            This feature is currently being built. Meanwhile, you can visit the
            available pages below:
          </Paragraph>
        </div>

        <List
          bordered
          dataSource={activePages}
          renderItem={(page) => (
            <List.Item
              actions={[
                <Link to={page.path} key={page.path}>
                  <Button
                    type="link"
                    icon={<ArrowRightOutlined />}
                    style={{ paddingLeft: 0 }}
                  >
                    Visit
                  </Button>
                </Link>,
              ]}
            >
              {page.name}
            </List.Item>
          )}
          style={{ borderRadius: "12px" }}
        />
      </Card>
    </div>
  );
}
