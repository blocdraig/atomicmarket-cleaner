import { APIClient } from '@wharfkit/antelope';
import { Session } from '@wharfkit/session';
import { WalletPluginPrivateKey } from '@wharfkit/wallet-plugin-privatekey';
import { AtomicAssetsAPIClient, Types } from '@wharfkit/atomicassets';
import { z } from 'zod';

const envSchema = z.object({
  ACTOR: z.string(),
  PERMISSION: z.string(),
  CHAIN_ID: z.hash('sha256'),
  CHAIN_URL: z.string(),
  PRIVATE_KEY: z.string(),
  ATOMIC_URL: z.string(),
});
const env = envSchema.parse(process.env);

const session = new Session({
  actor: env.ACTOR,
  permission: env.PERMISSION,
  chain: {
    id: env.CHAIN_ID,
    url: env.CHAIN_URL,
  },
  walletPlugin: new WalletPluginPrivateKey(env.PRIVATE_KEY),
});

const atomic = new AtomicAssetsAPIClient(
  new APIClient({ url: env.ATOMIC_URL })
);

const logtime = () => {
  return new Date().toISOString().slice(0, -5).replace('T', ' ') + ': ';
};

const cancelInvalidSales = async () => {
  let invalidSales = await atomic.atomicmarket.v2.get_sales({
    state: [Types.SaleState.INVALID],
    sort: 'updated',
    order: 'asc',
    limit: 100,
  });

  if (invalidSales.data.length === 0) {
    console.log(logtime() + 'No invalid sales found');
    return;
  }

  console.log(logtime() + `Found ${invalidSales.data.length} invalid sales`);

  const actions = [];

  for (const sale of invalidSales.data) {
    actions.push({
      account: 'atomicmarket',
      name: 'cancelsale',
      authorization: [session.permissionLevel],
      data: { sale_id: sale.sale_id },
    });
  }

  if (actions.length === 0) {
    console.log(logtime() + 'No actions to execute');
    return;
  }

  const result = await session.transact({ actions });
  console.log(logtime() + `Transaction was successfully broadcast!`);
  console.log(logtime() + result.response?.transaction_id);
};

const pollInvalidSales = async () => {
  console.info(logtime() + '* Invalid Sales');
  let waitSeconds = 60;
  try {
    await cancelInvalidSales();
  } catch (e: any) {
    console.error(logtime() + `${e && e.message}`, e);
  }
  console.info(logtime() + `Waiting ${waitSeconds} seconds before next run`);
  console.info(logtime() + `--<>--<>--<>--<>--<>--<>--<>--<>--`);
  setTimeout(pollInvalidSales, waitSeconds * 1000);
};

const init = async () => {
  console.info(logtime() + '* Init');
  console.info(logtime() + `--<>--<>--<>--<>--<>--<>--<>--<>--`);
  await pollInvalidSales();
};

init();
