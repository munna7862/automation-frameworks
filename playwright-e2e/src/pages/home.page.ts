import { BasePage } from '@core/base/base.page';

export class HomePage extends BasePage {
  get heading() {
    return 'h1';
  }

  async verifyLandingPage() {
    await this.assertVisible(this.heading);
  }
}
