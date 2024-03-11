import express, { Request, Response, NextFunction } from "express";
import { z, AnyZodObject } from "zod";

const app = express();

app.use(express.json());

const dataSchema = z.object({
	body: z.object({
		fullName: z
			.string({
				required_error: "Full name is required",
			})
			.min(3, "Full name must be at least 3 characters"),
		email: z
			.string({
				required_error: "Email is required",
			})
			.email("Not a valid email"),
	}),
	query: z.object({
		sport: z
			.string({
				required_error: "sport is required",
			})
			.min(3, "sport must be at least 3 characters"),
		name: z.string({
			required_error: "name is required",
		}),
	}),
	params: z.object({
		id: z
			.string({
				required_error: "id is required",
			})
			.min(3, "id must be at least 3 characters"),
	}),
});

const validate =
	(schema: AnyZodObject) =>
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const resp = await schema.safeParseAsync({
				body: req.body,
				query: req.query,
				params: req.params,
			});
			if (resp.success) return next();
			return res.status(400).json({
				success: resp.success,
				message: resp.error?.issues[0]?.message,
			});
		} catch (error) {
			return res.status(400).json(error);
		}
	};

app.get("/", (req: Request, res: Response): Response => {
	return res.json({ message: "Validation with Zod 👊" });
});

app.post(
	"/create/:id/:valid?",
	validate(dataSchema),
	(req: Request, res: Response): Response => {
		console.log(req.params);
		return res.json({ ...req.body, ...req.query, ...req.params });
	}
);

const start = (): void => {
	try {
		app.listen(3333, () => {
			console.log("Server started on port 3333");
		});
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
};
start();
