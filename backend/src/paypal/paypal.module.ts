import { Module } from '@nestjs/common';
import { PayPalService } from './paypal.service';
import { PayPalController } from './paypal.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [PrismaModule, SupabaseModule],
  providers: [PayPalService],
  controllers: [PayPalController],
  exports: [PayPalService],
})
export class PayPalModule {}
