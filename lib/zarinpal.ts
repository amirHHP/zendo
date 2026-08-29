/**
 * ZarinPal Payment Gateway Helper
 */

interface PaymentRequestOptions {
  amount: number; // in Tomans
  description: string;
  callbackUrl: string;
  email?: string;
  mobile?: string;
}

interface PaymentVerifyOptions {
  amount: number; // in Tomans
  authority: string;
}

export class ZarinpalService {
  private merchantId: string;
  private isSandbox: boolean;
  private baseUrl: string;
  private payUrl: string;

  constructor() {
    this.merchantId = process.env.ZARINPAL_MERCHANT_ID || '00000000-0000-0000-0000-000000000000';
    this.isSandbox = process.env.ZARINPAL_SANDBOX === 'true';
    
    this.baseUrl = this.isSandbox
      ? 'https://sandbox.zarinpal.com/pg/v4/payment'
      : 'https://api.zarinpal.com/pg/v4/payment';

    this.payUrl = this.isSandbox
      ? 'https://sandbox.zarinpal.com/pg/StartPay'
      : 'https://www.zarinpal.com/pg/StartPay';
  }

  /**
   * Request a new payment authority from Zarinpal
   */
  async requestPayment({ amount, description, callbackUrl, email, mobile }: PaymentRequestOptions) {
    try {
      const response = await fetch(`${this.baseUrl}/request.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          merchant_id: this.merchantId,
          amount,
          description,
          callback_url: callbackUrl,
          metadata: {
            email: email || '',
            mobile: mobile || '',
          },
        }),
      });

      const json = await response.json();

      if (json.data && json.data.code === 100) {
        return {
          success: true,
          authority: json.data.authority as string,
          url: `${this.payUrl}/${json.data.authority}`,
        };
      }

      const errorMessage = json.errors?.message || 'خطا در اتصال به درگاه زرین‌پال';
      return {
        success: false,
        error: errorMessage,
        code: json.errors?.code,
      };
    } catch (err: any) {
      console.error('Zarinpal request error:', err);
      return {
        success: false,
        error: err.message || 'خطای شبکه در ارتباط با زرین‌پال',
      };
    }
  }

  /**
   * Verify an authorized payment
   */
  async verifyPayment({ amount, authority }: PaymentVerifyOptions) {
    try {
      const response = await fetch(`${this.baseUrl}/verify.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          merchant_id: this.merchantId,
          amount,
          authority,
        }),
      });

      const json = await response.json();

      // Code 100: Verified, Code 101: Already Verified
      if (json.data && (json.data.code === 100 || json.data.code === 101)) {
        return {
          success: true,
          refId: json.data.ref_id?.toString() || '0',
          code: json.data.code,
          cardPan: json.data.card_pan,
        };
      }

      return {
        success: false,
        error: json.errors?.message || 'تراکنش ناموفق بود یا توسط کاربر لغو شد.',
        code: json.errors?.code,
      };
    } catch (err: any) {
      console.error('Zarinpal verify error:', err);
      return {
        success: false,
        error: err.message || 'خطای سرور در تایید تراکنش',
      };
    }
  }
}

export const zarinpal = new ZarinpalService();
