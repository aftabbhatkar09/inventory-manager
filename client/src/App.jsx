import { Routes, Route } from "react-router-dom";

import MainLayout from "./layout/mainLayout";

import DashboardPage from "./pages/dashboard/dashboardPage";

import ProductPage from "./pages/product/productPage";
import CreateProductPage from "./pages/product/createProductPage";
import EditProductPage from "./pages/product/editProductPage";

import PartyPage from "./pages/party/partyPage";
import CreatePartyPage from "./pages/party/createPartyPage";
import EditPartyPage from "./pages/party/editPartyPage";
import PartyLedgerPage from "./pages/party/partyLedgerPage";

import TransactionPage from "./pages/transaction/transactionPage";
import CreateTransactionPage from "./pages/transaction/createTransactionPage";
import EditTransactionPage from "./pages/transaction/editTransactionPage";

import PaymentPage from "./pages/payment/paymentPage";
import CreatePaymentPage from "./pages/payment/createPaymentPage";
import EditPaymentPage from "./pages/payment/editPaymentPage";

import OutStandingReport from "./pages/reports/outStandingReport";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductPage />} />
        <Route path="products/createProduct" element={<CreateProductPage />} />
        <Route path="products/editProduct/:id" element={<EditProductPage />} />
        <Route path="parties" element={<PartyPage />} />
        <Route path="parties/createParty" element={<CreatePartyPage />} />
        <Route path="parties/editParty/:id" element={<EditPartyPage />} />
        <Route path="parties/partyLedger/:id" element={<PartyLedgerPage />} />
        <Route path="transactions" element={<TransactionPage />} />
        <Route
          path="transactions/createTransaction"
          element={<CreateTransactionPage />}
        />
        <Route
          path="transactions/editTransaction/:id"
          element={<EditTransactionPage />}
        />
        <Route path="payments" element={<PaymentPage />} />
        <Route path="payments/createPayment" element={<CreatePaymentPage />} />
        <Route path="payments/editPayment/:id" element={<EditPaymentPage />} />
        <Route path="reports/outstanding" element={<OutStandingReport />} />
      </Route>
    </Routes>
  );
}

export default App;
