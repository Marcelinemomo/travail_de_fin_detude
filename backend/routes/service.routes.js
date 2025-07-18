const routes = require('express').Router();
const multer =  require('multer');
const upload = multer({ dest: '../client/public/uploads/service'});


const { verifyToken } = require('../controllers/auth.controller');
const Service = require('../service');
const service = new Service();

routes.post("/", verifyToken, service.createService_);
routes.get("/", verifyToken, service.readServices_);
routes.get("/search", verifyToken, service.searchServices_);

routes.get("/favorite/:id", verifyToken, service.readFavoriteService_);
routes.get("/:id", verifyToken, service.readService_);
routes.get("/provider/:id", verifyToken, service.readServiceByProviderId_);
routes.put("/:id", verifyToken, service.updateService_);
routes.put("/copy-to/:id", verifyToken, service.copyServiceTo_);

routes.get("/stats/:id", verifyToken, service.userServiceStats_);
routes.delete("/:id", verifyToken, service.deleteService_);
routes.delete("/allservice/:id", verifyToken, service.deleteAllUserService_);
routes.post("/upload/:id", verifyToken, upload.array("files"), service.updateServiceImgs_);


module.exports = routes;