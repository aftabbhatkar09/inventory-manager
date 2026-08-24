import { Routes, Route } from "react-router-dom";

import MainLayout from "./layout/mainLayout";

import ProductPage from "./pages/product/productPage";
import CreateProductPage from "./pages/product/createProductPage";
import EditProductPage from "./pages/product/editProductPage";

import PartyPage from "./pages/party/partyPage";
import CreatePartyPage from "./pages/party/createPartyPage";
import EditPartyPage from "./pages/party/editPartyPage";
import PartyLedgerPage from "./pages/party/partyLedgerPage";

import TransactionPage from "./pages/transaction/transactionPage";
import CreateTransactionPage from "./pages/transaction/createTransactionPage";

import OutStandingReport from "./pages/reports/outStandingReport";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
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
        <Route path="reports/outstanding" element={<OutStandingReport />} />
      </Route>
    </Routes>
  );
}

export default App;
