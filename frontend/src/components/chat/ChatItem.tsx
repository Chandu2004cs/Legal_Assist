import ReactMarkdown from 'react-markdown';
import reactGFM from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

import styles from './ChatItem.module.css';
import 'highlight.js/styles/atom-one-dark.css';

import botIcon from '/logos/bot.png';
import { useAuth } from '../../context/context';

type Props = {
	id: string;
	content: string;
	role: string;
};

const ChatItem = ({ content, role }: Props) => {
	const auth = useAuth();

	const userName = auth?.user?.name || '';
	const nameParts = userName.split(' ');
	const initials = nameParts[0]?.[0]?.toUpperCase() + (nameParts[1]?.[0]?.toUpperCase() || '');
	return (
		<div className={`${styles.messageContainer} ${role === 'assistant' ? styles.assistant : styles.user}`}>
			<div className={styles.avatar}>
				{role === 'assistant' ? (
					<img src={botIcon} alt='bot' />
				) : (
					<div className={styles.initials}>{initials}</div>
				)}
			</div>

			<div className={`${styles.messageBubble} markdown-body`}>
				{role === 'assistant' ? (
					<ReactMarkdown
						remarkPlugins={[reactGFM]}
						rehypePlugins={[rehypeHighlight]}>
						{content}
					</ReactMarkdown>
				) : (
					<p>{content}</p>
				)}
			</div>
		</div>
	);
};

export default ChatItem;
