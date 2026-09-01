import { SetMetadata } from '@nestjs/common';

export const REQUIRE_PRO_KEY = 'requirePro';
export const RequirePro = () => SetMetadata(REQUIRE_PRO_KEY, true);
