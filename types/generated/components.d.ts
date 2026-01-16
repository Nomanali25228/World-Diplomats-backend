import type { Schema, Struct } from '@strapi/strapi';

export interface DelegatesDelegate extends Struct.ComponentSchema {
  collectionName: 'components_delegates_delegates';
  info: {
    description: '';
    displayName: 'delegate';
  };
  attributes: {
    DoYouHaveAFoodpreference: Schema.Attribute.String;
    name: Schema.Attribute.String;
    pricepackage: Schema.Attribute.String;
    WhatIsYourShirtSize: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'delegates.delegate': DelegatesDelegate;
    }
  }
}
