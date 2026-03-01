import jwt from "jsonwebtoken";

export const authMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        issuer: "trainer-platform",
        audience: "trainer-users",
      });

      if (allowedRoles.length && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }

      req.user = { ...decoded, id: decoded.userId };
      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
  };
};
