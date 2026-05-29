import { PersonalDetailsForm } from "@/components/apply/PersonalDetailsForm";

export default function PersonalDetailsPage({
  searchParams,
}: {
  searchParams: { new?: string };
}) {
  return <PersonalDetailsForm isNewApplication={searchParams.new === "1"} />;
}
