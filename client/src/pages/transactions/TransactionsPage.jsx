import TransactionsTable from "../../common/components/SISTransactionsTable";
import PageHeader from "../../common/components/PageHeader";
import { Import, Plus } from "lucide-react";
import { Spin } from "antd";
import { useDispatchStore } from "../../stores/useDispatchStore";

const TransactionsPage = () => {
  const { dispatchLoading } = useDispatchStore();
  return (
    <>
      <PageHeader
        title="Transactions"
        button={[
          {
            name: "Add Transaction",
            icon: Plus,
            bgColor: "bg-blue-600",
            link: "/transactions/create",
          },
          {
            name: "Import Transactions",
            icon: Import,
            bgColor: "bg-blue-800",
            link: "#",
          },
        ]}
      />
      <Spin spinning={dispatchLoading} size="large" fullscreen={true}></Spin>
      <div className="bg-white border border-gray-200 m-3 py-4 h-full rounded-xl shadow-md">
        <TransactionsTable isSelect={true} isGlobal={true} />
      </div>
    </>
  );
};

export default TransactionsPage;
