import { AppRoles, RunEnvironment } from "./roles.js";

type GroupRoleMapping = Record<string, AppRoles[]>;
type AzureRoleMapping = Record<string, AppRoles[]>;

export type ConfigType = {
  GroupRoleMapping: GroupRoleMapping;
  ValidCorsOrigins: (string | RegExp)[];
  AadValidClientId?: string; // CHANGE ME to required if using Azure AD Auth
  AzureRoleMapping?: AzureRoleMapping; // CHANGE ME to required if using Azure AD Auth with roles
};

type GenericConfigType = {
  DynamoTableName: string;
  ConfigSecretName: string;
  AwsRegion: string;
};

type EnvironmentConfigType = {
  [env in RunEnvironment]: ConfigType;
};


const genericConfig: GenericConfigType = {
  DynamoTableName: "infra-events-ticketing-metadata",
  ConfigSecretName: "invalid-secret",
  AwsRegion: "us-east-1",
}

const ticketeventConfig: GenericConfigType = {
  DynamoTableName: "infra-events-ticketing-metadata",
  ConfigSecretName: "invalid-secret",
  AwsRegion: "us-east-1",
} as const; // CHANGE ME to config secret

const mercheventConfig: GenericConfigType = {
  DynamoTableName: "infra-merchstore-metadata",
  ConfigSecretName: "invalid-secret",
  AwsRegion: "us-east-1",
} as const;

const environmentConfig: EnvironmentConfigType = {
  dev: {
    GroupRoleMapping: {
      "48591dbc-cdcb-4544-9f63-e6b92b067e33": [AppRoles.MANAGER], // Infra Chairs
      "0": [AppRoles.MANAGER], // Dummy Group for development only
    },
    ValidCorsOrigins: ["http://localhost:3000", /\.acmuiuc\.\.pages\.dev$/],
  },
  prod: {
    GroupRoleMapping: {
      "48591dbc-cdcb-4544-9f63-e6b92b067e33": [AppRoles.MANAGER], // Infra Chairs
      "ff49e948-4587-416b-8224-65147540d5fc": [AppRoles.MANAGER], // Officers
    },
    ValidCorsOrigins: [
      "https:///acm.illinois.edu",
      "https:///www.acm.illinois.edu",
      /\.acmuiuc\.\.pages\.dev$/,
    ], // CHANGE ME as needed
  },
} as const;

export { genericConfig, ticketeventConfig, mercheventConfig, environmentConfig };
