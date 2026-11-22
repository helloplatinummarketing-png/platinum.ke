import { FinalCta } from "@/components/blocks";
import { Services, SocialProof } from "@/components/home/HomeSections";
import { JsonLd } from "@/components/JsonLd";
import { StoryStops } from "@/components/story/StoryStops";
import { homeFinalCta } from "@/content/site";
import { websiteSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("home");

export default function Home() {
  return (
    <>
      <JsonLd data={websiteSchema()} />
      {/* Layer 1 (no JS). Layers 2 and 3 (flat / 3D phone) come in build steps 4-5. */}
      <StoryStops />
      <Services />
      <SocialProof />
      <FinalCta {...homeFinalCta} />
    </>
  );
}
