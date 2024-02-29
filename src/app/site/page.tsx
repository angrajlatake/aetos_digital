import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { pricingCards } from "@/lib/constants";
import { Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <section className="relative h-full w-full pt-36 flex items-center justify-center flex-col">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <p>Run your agency in one place</p>
        <div className="bg-gradient-to-r from-primary to-secondary-foreground text-transparent bg-clip-text relative">
          <h1 className="text-9xl font-bold text-center md:text-[300px]">
            Aetos
          </h1>
        </div>
        <div className="flex justify-center items-center relative md:mt-[-70px]">
          <Image
            src={"/assets/preview.png"}
            width={1200}
            height={1200}
            alt={"Aetos preview"}
            className="rounded-tl-2xl rounded-tr-2xl border-2 border-muted"
          />
          <div className="bottom-0 top-[50%] bg-gradient-to-t dark:from-background left-0 right-0 absolute z-10"></div>
        </div>
      </section>
      {/* TODO: check margin top for second section */}
      <section className="flex flex-col items-center justify-center gap-4 md:!mt-20 mt-[-60px]">
        <h2 className="text-center text-4xl">Choose what fits for you</h2>
        <p className="text-center text-muted-foreground">
          Our pricing plans are tailoered to meet your needs. If {"you're"} not{" "}
          <br />
          ready to commit you can try our free plan.
        </p>
        <div className="flex justify-center gap-4 flex-wrap mt-6">
          {/* TODO: wire up free product to stripe */}
          {pricingCards.map((card, index) => (
            <Card
              className={`w-[300px] flex flex-col justify-between border-2 ${
                card.title === "Unlimited Saas" ? "border-primary" : ""
              } `}
              key={index}
            >
              <CardHeader>
                <CardTitle
                  className={`${
                    card.title === "Unlimited Saas"
                      ? ""
                      : "text-muted-foreground"
                  }`}
                >
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span className="font-bold text-4xl">{card.price}</span>
                <span className="text-muted-foreground">/m</span>
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-4">
                <p className="text-muted-foreground">{card.description}</p>
                <div className="">
                  {card.features.map((feature, index) => (
                    <div key={index} className="flex g2 items-center">
                      <Check className="text-muted-foreground pr-1" size={24} />
                      <p>{feature}</p>
                    </div>
                  ))}
                </div>
                <Link
                  href={`agency?plan=${card.priceId}`}
                  className={buttonVariants({
                    className: "w-full",
                    variant: card.title === "Unlimited Saas" ? "" : "secondary",
                  })}
                >
                  Login
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
