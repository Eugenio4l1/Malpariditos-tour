using Microsoft.AspNetCore.Mvc;

namespace aspnet.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}