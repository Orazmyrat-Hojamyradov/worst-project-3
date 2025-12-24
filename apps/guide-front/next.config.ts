import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
 
const nextConfig: NextConfig = {
  allowedDevOrigins: ['10.46.179.236'],
};

const withNextIntl = createNextIntlPlugin()
export default withNextIntl(nextConfig)