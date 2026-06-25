import Dashboard from "./Dashboard";
import MenuManagementPage from "./MenuManagementPage";
import TestPage from "./TestPage";
import TanvirPage from "./TanvirPage";
import UserPage from "./UserPage";
import Expencepayableentry from "./Expencepayableentry";


// Map menuLink to actual React component
const menuPages = {
  "/dashboard": Dashboard,
  "/expence-payable-entry": Expencepayableentry,
  // "/income-nonlisted-bond": IncomeNonListed,
   "/user-management": UserPage,
  "/menu-management": MenuManagementPage,
  "/test": TestPage,
   "/tanvir": TanvirPage,
   "user-test": TestPage,

};

export default menuPages;