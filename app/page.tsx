import { FinalCta } from "@/components/blocks";
import { Services, SocialProof } from "@/components/home/HomeSections";
import { JsonLd } from "@/components/JsonLd";
import { PhotoStory } from "@/components/story/PhotoStory";
import { homeFinalCta } from "@/content/site";
import { websiteSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("home");

export default function Home() {
  return (
    <>
      <JsonLd data={websiteSchema()} />
      {/* The Nairobi photo story (Layers 1-3: components/story/PhotoStory.tsx) */}
      <PhotoStory />
      <Services />
      <SocialProof />
      <FinalCta {...homeFinalCta} />
    </>
  );
}
