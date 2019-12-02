var auth= {
  is_login: function (req, res, next)
	{
		if (!req.session.is_login)
		{
			return res.redirect('/');
		}
		next();
	},
};
module.exports = auth;
