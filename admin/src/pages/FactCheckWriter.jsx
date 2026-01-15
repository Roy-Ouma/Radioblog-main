import {
  Button,
  Select,
  TextInput,
  useMantineColorScheme,
  Textarea,
  Card,
  Group,
  Badge,
  ActionIcon,
  Text,
  Divider,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import useStore from "../store";
import { createSlug, uploadFile } from "../utils";

import { Link, RichTextEditor } from "@mantine/tiptap";
import { IconColorPicker, IconPlus, IconTrash } from "@tabler/icons-react";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import SubScript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { BubbleMenu, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { BiImages } from "react-icons/bi";
import { Toaster, toast } from "sonner";
import Loading from "../components/Loading";
import { useCreatePost } from "../hooks/post-hook";

const VERDICTS = [
  { label: "Correct", value: "CORRECT" },
  { label: "Incorrect", value: "INCORRECT" },
  { label: "Unproven", value: "UNPROVEN" },
];

const FactCheckWriter = () => {
  const { colorScheme } = useMantineColorScheme();

  const { user } = useStore();
  const [visible, { toggle }] = useDisclosure(false);
  const { isPending, mutate } = useCreatePost(toast, toggle, user?.token);

  const [title, setTitle] = useState("");
  const [fileURL, setFileURL] = useState("");
  const [uploadPreview, setUploadPreview] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Fact-check specific state
  const [claims, setClaims] = useState([
    { id: 1, claim: "", verdict: "UNPROVEN", evidence: "" }
  ]);

  const theme = colorScheme === "dark";

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Write additional context or explanation..." }),
      Underline,
      Link,
      Superscript,
      SubScript,
      Highlight,
      TextStyle,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: "",
  });

  const addClaim = () => {
    const newId = Math.max(...claims.map(c => c.id)) + 1;
    setClaims([...claims, { id: newId, claim: "", verdict: "UNPROVEN", evidence: "" }]);
  };

  const removeClaim = (id) => {
    if (claims.length > 1) {
      setClaims(claims.filter(c => c.id !== id));
    }
  };

  const updateClaim = (id, field, value) => {
    setClaims(claims.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const generateContent = () => {
    let content = "";

    claims.forEach((claim, index) => {
      content += `${index + 1}. ${claim.claim}\n\n`;
      content += `Verdict: ${claim.verdict}\n\n`;
      if (claim.evidence.trim()) {
        content += `Evidence: ${claim.evidence}\n\n`;
      }
      content += "---\n\n";
    });

    // Add additional content from rich text editor
    const additionalContent = editor?.getHTML();
    if (additionalContent) {
      content += additionalContent;
    }

    return content;
  };

  const handleSubmit = async () => {
    if (isUploading) {
      toast.error("Please wait for the image upload to finish.");
      return;
    }

    if (!title || title.trim().length === 0) {
      toast.error("Fact-check title is required.");
      return;
    }

    if (!fileURL) {
      toast.error("Featured image is required.");
      return;
    }

    // Validate claims
    const validClaims = claims.filter(c => c.claim.trim().length > 0);
    if (validClaims.length === 0) {
      toast.error("At least one claim is required.");
      return;
    }

    const content = generateContent();
    if (!content.trim()) {
      toast.error("Content is required.");
      return;
    }

    mutate({
      title,
      slug: createSlug(title),
      cat: "fact-check",
      img: fileURL,
      desc: content,
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError("");

    try {
      const url = await uploadFile(file, setUploadProgress);
      setFileURL(url);
      setUploadPreview(URL.createObjectURL(file));
    } catch (error) {
      setUploadError("Failed to upload image. Please try again.");
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const getVerdictColor = (verdict) => {
    switch (verdict) {
      case "CORRECT": return "green";
      case "INCORRECT": return "red";
      default: return "yellow";
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <Toaster richColors />

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create Fact Check
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Structure your fact-check with claims, verdicts, and evidence
          </p>
        </div>

        <Card shadow="sm" padding="lg" className="mb-6">
          <div className="space-y-6">
            {/* Title */}
            <TextInput
              label="Fact Check Title"
              placeholder="Enter the main fact-check title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              size="md"
            />

            {/* Featured Image */}
            <div>
              <Text size="sm" fw={500} className="mb-2">Featured Image</Text>
              <div className="flex items-center gap-4">
                <Button
                  component="label"
                  leftSection={<BiImages />}
                  variant="outline"
                  loading={isUploading}
                  disabled={isUploading}
                >
                  {isUploading ? `Uploading... ${uploadProgress}%` : "Upload Image"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    hidden
                  />
                </Button>
                {uploadPreview && (
                  <img
                    src={uploadPreview}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded"
                  />
                )}
              </div>
              {uploadError && (
                <Text size="sm" c="red" className="mt-1">{uploadError}</Text>
              )}
            </div>
          </div>
        </Card>

        {/* Claims Section */}
        <Card shadow="sm" padding="lg" className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Text size="lg" fw={600}>Claims to Verify</Text>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={addClaim}
              variant="light"
              size="sm"
            >
              Add Claim
            </Button>
          </div>

          <div className="space-y-4">
            {claims.map((claim, index) => (
              <Card key={claim.id} withBorder padding="md" className="relative">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="light" size="lg">
                    Claim {index + 1}
                  </Badge>
                  {claims.length > 1 && (
                    <ActionIcon
                      color="red"
                      variant="light"
                      onClick={() => removeClaim(claim.id)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  )}
                </div>

                <div className="space-y-3">
                  <Textarea
                    label="Claim Statement"
                    placeholder="Enter the claim to be fact-checked"
                    value={claim.claim}
                    onChange={(e) => updateClaim(claim.id, 'claim', e.target.value)}
                    minRows={2}
                    required
                  />

                  <Select
                    label="Verdict"
                    placeholder="Select verdict"
                    data={VERDICTS}
                    value={claim.verdict}
                    onChange={(value) => updateClaim(claim.id, 'verdict', value)}
                    required
                  />

                  <Textarea
                    label="Evidence & Explanation"
                    placeholder="Provide evidence and explanation for the verdict"
                    value={claim.evidence}
                    onChange={(e) => updateClaim(claim.id, 'evidence', e.target.value)}
                    minRows={3}
                  />
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Additional Content */}
        <Card shadow="sm" padding="lg" className="mb-6">
          <Text size="lg" fw={600} className="mb-4">Additional Context (Optional)</Text>
          <RichTextEditor editor={editor} className="min-h-[200px]">
            {editor && (
              <BubbleMenu editor={editor}>
                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Bold />
                  <RichTextEditor.Italic />
                  <RichTextEditor.Underline />
                  <RichTextEditor.Strikethrough />
                  <RichTextEditor.ClearFormatting />
                  <RichTextEditor.Highlight />
                  <RichTextEditor.Code />
                </RichTextEditor.ControlsGroup>
              </BubbleMenu>
            )}

            <RichTextEditor.Content />
          </RichTextEditor>
        </Card>

        {/* Submit Button */}
        <Group justify="center" className="mt-8">
          <Button
            size="lg"
            onClick={handleSubmit}
            loading={isPending}
            disabled={isUploading}
          >
            {isPending ? "Publishing..." : "Publish Fact Check"}
          </Button>
        </Group>
      </div>

      <Loading visible={visible} />
    </div>
  );
};

export default FactCheckWriter;