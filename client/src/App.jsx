import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import MainLayout from "./layout/mainLayout";
import RequireAuth from "./components/RequireAuth";
import RequireSuperAdmin from "./components/RequireSuperAdmin";
import RouteLoader from "./components/RouteLoader";

const LoginPage = lazy(() => import("./pages/auth/loginPage"));

const DashboardPage = lazy(() => import("./pages/dashboard/dashboardPage"));

const ProductPage = lazy(() => import("./pages/product/productPage"));
const CreateProductPage = lazy(() => import("./pages/product/createProductPage"));
const EditProductPage = lazy(() => import("./pages/product/editProductPage"));

const PartyPage = lazy(() => import("./pages/party/partyPage"));
const CreatePartyPage = lazy(() => import("./pages/party/createPartyPage"));
const EditPartyPage = lazy(() => import("./pages/party/editPartyPage"));
const PartyLedgerPage = lazy(() => import("./pages/party/partyLedgerPage"));

const TransactionPage = lazy(() => import("./pages/transaction/transactionPage"));
const CreateTransactionPage = lazy(() =>
  import("./pages/transaction/createTransactionPage"),
);
const EditTransactionPage = lazy(() =>
  import("./pages/transaction/editTransactionPage"),
);

const PaymentPage = lazy(() => import("./pages/payment/paymentPage"));
const CreatePaymentPage = lazy(() => import("./pages/payment/createPaymentPage"));
const EditPaymentPage = lazy(() => import("./pages/payment/editPaymentPage"));

const GodownPage = lazy(() => import("./pages/godown/godownPage"));
const CreateGodownPage = lazy(() => import("./pages/godown/createGodownPage"));
const EditGodownPage = lazy(() => import("./pages/godown/editGodownPage"));
const GodownStockPage = lazy(() => import("./pages/godown/godownStockPage"));

const StockTransferPage = lazy(() => import("./pages/stockTransfer/stockTransferPage"));
const CreateStockTransferPage = lazy(() =>
  import("./pages/stockTransfer/createStockTransferPage"),
);

const OutStandingReport = lazy(() => import("./pages/reports/outStandingReport"));

const UserPage = lazy(() => import("./pages/user/userPage"));
const CreateUserPage = lazy(() => import("./pages/user/createUserPage"));
const EditUserPage = lazy(() => import("./pages/user/editUserPage"));

function App() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<RequireAuth />}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="products" element={<ProductPage />} />
            <Route
              path="products/createProduct"
              element={<CreateProductPage />}
            />
            <Route
              path="products/editProduct/:id"
              element={<EditProductPage />}
            />
            <Route path="parties" element={<PartyPage />} />
            <Route path="parties/createParty" element={<CreatePartyPage />} />
            <Route path="parties/editParty/:id" element={<EditPartyPage />} />
            <Route
              path="parties/partyLedger/:id"
              element={<PartyLedgerPage />}
            />
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
            <Route
              path="payments/createPayment"
              element={<CreatePaymentPage />}
            />
            <Route
              path="payments/editPayment/:id"
              element={<EditPaymentPage />}
            />
            <Route path="godowns" element={<GodownPage />} />
            <Route path="godowns/createGodown" element={<CreateGodownPage />} />
            <Route path="godowns/editGodown/:id" element={<EditGodownPage />} />
            <Route path="godowns/stock/:id" element={<GodownStockPage />} />
            <Route path="stock-transfers" element={<StockTransferPage />} />
            <Route
              path="stock-transfers/createTransfer"
              element={<CreateStockTransferPage />}
            />
            <Route
              path="reports/outstanding"
              element={<OutStandingReport />}
            />

            <Route element={<RequireSuperAdmin />}>
              <Route path="users" element={<UserPage />} />
              <Route path="users/createUser" element={<CreateUserPage />} />
              <Route path="users/editUser/:id" element={<EditUserPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
