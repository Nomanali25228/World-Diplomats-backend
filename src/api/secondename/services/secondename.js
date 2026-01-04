'use strict';

/**
 * secondename service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::secondename.secondename');
