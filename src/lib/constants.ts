import { ColumnDefinitionType } from '../ui/components';
import {
  AllValidatorsTableDataType,
  MyValidatorsTableDataType,
} from '../ui/containers';

export const DEFAULT_LEGACY_CONFIG = {
  CONFIG: {
    update_ms: 30000,
  },
  NETWORKS: ['testnet'],
  NETWORK_CONFIG: {
    testnet: {
      grpc: 'http://testnet.penumbra.zone:8080',
      tendermint: 'http://testnet.penumbra.zone:26657',
    },
  },
  MESSAGES_CONFIG: {
    message_expiration_ms: 30 * 60 * 1000,
    update_messages_ms: 30 * 1000,
    max_messages: 100,
    notification_title_max: 20,
    notification_interval_min: 30 * 1000,
    notification_message_max: 250,
  },
  PACK_CONFIG: {
    max: 7,
    allow_tx: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  },
  IDLE: {
    idle: 0,
    '5m': 5 * 60 * 1000,
    '10m': 10 * 60 * 1000,
    '20m': 20 * 60 * 1000,
    '40m': 40 * 60 * 1000,
    '1h': 60 * 60 * 1000,
  },
};

export const TESTNET_URL = 'http://testnet.penumbra.zone:8080';

export const columnsAllValidator: Array<
  ColumnDefinitionType<
    AllValidatorsTableDataType,
    keyof AllValidatorsTableDataType
  >
> = [
  {
    Header: 'Validator',
    accessor: 'name',
    sortable: false,
  },
  {
    Header: 'Voting Power',
    accessor: 'votingPower',
    sortable: true,
  },
  {
    Header: 'Commission',
    accessor: 'commission',
    sortable: true,
  },
  {
    Header: 'APR',
    accessor: 'arp',
    sortable: true,
  },
  {
    Header: '',
    accessor: 'manage',
    sortable: false,
  },
];

export const columnsMyValidator: Array<
  ColumnDefinitionType<
    MyValidatorsTableDataType,
    keyof MyValidatorsTableDataType
  >
> = [
  {
    Header: 'Validator',
    accessor: 'name',
    sortable: false,
  },
  {
    Header: 'Amound Staked',
    accessor: 'stakedCurrency',
    sortable: true,
  },
  {
    Header: 'Claimable Rewards',
    accessor: 'rewardsCurrency',
    sortable: true,
  },

  {
    Header: '',
    accessor: 'manage',
    sortable: false,
  },
];
