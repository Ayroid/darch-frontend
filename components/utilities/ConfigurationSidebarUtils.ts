import { AWSResourceConfiguration } from "@/lib/types/aws-resources";

const handleTagChange = (
	config: AWSResourceConfiguration,
	key: string,
	value: string,
	onChange: (config: AWSResourceConfiguration) => void
) => {
	const currentTags = config.tags || {};
	if (value === "") {
		const newTags = { ...currentTags };
		delete newTags[key];
		onChange({ ...config, tags: newTags });
	} else {
		onChange({
			...config,
			tags: { ...currentTags, [key]: value },
		});
	}
};

const addTag = (
	config: AWSResourceConfiguration,
	onChange: (config: AWSResourceConfiguration) => void
) => {
	const currentTags = config.tags || {};
	const key = `Key${Object.keys(currentTags).length + 1}`;
	onChange({
		...config,
		tags: { ...currentTags, [key]: "" },
	});
};

const removeTag = (
	config: AWSResourceConfiguration,
	onChange: (config: AWSResourceConfiguration) => void,
	keyToRemove: string
) => {
	const currentTags = config.tags || {};
	const newTags = { ...currentTags };
	delete newTags[keyToRemove];
	onChange({ ...config, tags: newTags });
};

export { handleTagChange, addTag, removeTag };
