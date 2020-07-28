module.exports = function () {
    require('./auth.route')(...arguments);
    require('./annex.route')(...arguments);
    require('./user.route')(...arguments);
    require('./association.route')(...arguments);
    require('./search.route')(...arguments);
    require('./product.route')(...arguments);
    require('./type.route')(...arguments);
    require('./ticket.route')(...arguments);
    require('./donation.route')(...arguments);
    require('./service.route')(...arguments);
};
