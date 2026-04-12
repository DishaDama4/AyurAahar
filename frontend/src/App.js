import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./homepage";
import LoginPage from "./loginpage";
import Register from "./register";
import CategoriesPage from "./categoriesPage";
import LikedPage from "./likedpage";
import ProfilePage from "./profilepage";
import RecipeDetailPage from "./recipe_details_page";
import AddRecipePage from "./add_recipes";
import SharedPage from "./sharedpage";
import DownloadsPage from "./downloadpage";
import CategoryRecipes from "./category_recipes";
import ManageRecipes from "./manage_recipes";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/liked" element={<LikedPage />} />
        <Route path="/profile" element={<ProfilePage />} />
         <Route path="/categories/:categoryId" element={<CategoryRecipes />} />
        <Route path="/recipe_details/:id" element={<RecipeDetailPage />} />
        <Route path="/add_recipe" element={<AddRecipePage />} />
        <Route path="/shared" element={<SharedPage />} />
        <Route path="/download" element={<DownloadsPage />} />
        <Route path="/manage_recipes" element={<ManageRecipes/>}/>
      </Routes>
    </BrowserRouter>
  );
}
export default App;