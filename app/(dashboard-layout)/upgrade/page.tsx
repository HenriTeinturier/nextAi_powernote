import { buttonVariants } from "@/components/ui/button";
import { BuyButton } from "@/features/stripe/BuyButton";
import { Check } from "lucide-react";

export default function PricingSection() {
  return (
    <section className="bg-background ">
      <div className="mx-auto max-w-screen-xl px-4 py-8 lg:px-6 lg:py-16">
        <div className="mx-auto mb-8 max-w-screen-md text-center lg:mb-12">
          <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-foreground">
            One plan for everyone.
          </h2>
          <p className="mb-5 font-light text-muted-foreground sm:text-xl">
            Stop forgetting about your life. Write with no limit.
          </p>
        </div>
        <div className="flex max-lg:flex-col">
          <div className="mx-auto flex h-fit w-full max-w-md flex-col rounded-lg border border-border bg-card p-6 text-center shadow xl:p-8">
            <h3 className="mb-4 text-2xl font-semibold">Premium</h3>
            <p className="font-light text-gray-500 dark:text-gray-400 sm:text-lg">
              Create infinity notes, talk and remember your life.
            </p>
            <div className="my-8 flex items-baseline justify-center">
              <span className="mr-2 text-5xl font-extrabold">$9</span>
              <span className="text-gray-500 dark:text-gray-400">/month</span>
            </div>
            <ul role="list" className="mb-8 space-y-4 text-left">
              <li className="flex items-center space-x-3">
                <Check className="text-green-500" size={16} />
                <span>Infinity notes</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="text-green-500" size={16} />
                <span>Chat with your notes</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="text-green-500" size={16} />
                <span>Daily note remember</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="text-green-500" size={16} />
                <span>Aumatate summary</span>
              </li>
            </ul>
            <BuyButton
              priceId={
                process.env.NODE_ENV === "development"
                  ? "price_1PVtHdIB8iJUbNveysxIcRj7"
                  : ""
              }
            >
              Became a premium
            </BuyButton>
          </div>
        </div>
      </div>
    </section>
  );
}
