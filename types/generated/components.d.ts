import type { Schema, Struct } from '@strapi/strapi';

export interface DelegatesDelegate extends Struct.ComponentSchema {
  collectionName: 'components_delegates_delegates';
  info: {
    description: '';
    displayName: 'delegate';
  };
  attributes: {
    doYouHaveAFoodpreference: Schema.Attribute.String;
    name: Schema.Attribute.String;
    whatIsYourShirtSize: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'delegates.delegate': DelegatesDelegate;
    }
  }
}
