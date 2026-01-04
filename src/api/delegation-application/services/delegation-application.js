'use strict';

/**
 * delegation-application service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::delegation-application.delegation-application');
