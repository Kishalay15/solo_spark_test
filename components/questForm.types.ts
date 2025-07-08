export interface QuestFormProps {
  onBack: () => void;
}

export interface QuestData {
  questionText: string;
  category: string;
  options: string[];
  pointValue: number;
}
