import "dotenv/config";

export function getAdmin(req, res) {
  res.render("admin", { error: null });
}

export function postAdmin(req, res) {
  if (req.body.password === process.env.ADMIN_PASSWORD) {
    global.isAdmin = true;
    res.redirect("/products");
  } else {
    res.render("admin", { error: "Incorrect password" });
  }
}
